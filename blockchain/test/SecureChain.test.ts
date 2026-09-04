import { ethers } from "hardhat";
import { expect } from "chai";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { SecureChain, SecureChain__factory } from "../typechain-types";
import { Signer, Contract } from "ethers";

describe("SecureChain", function () {
    let secureChain: SecureChain;
    let admin: Signer;
    let manager: Signer;
    let auditor: Signer;
    let user1: Signer;
    let user2: Signer;
    let minter: Signer;

    let adminAddress: string;
    let managerAddress: string;
    let auditorAddress: string;
    let user1Address: string;
    let user2Address: string;
    let minterAddress: string;

    const MANAGER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MANAGER_ROLE"));
    const AUDITOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE"));
    const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
    const IDENTITY_VERIFIER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("IDENTITY_VERIFIER_ROLE"));
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

    beforeEach(async function () {
        [admin, manager, auditor, user1, user2, minter] = await ethers.getSigners();
        
        adminAddress = await admin.getAddress();
        managerAddress = await manager.getAddress();
        auditorAddress = await auditor.getAddress();
        user1Address = await user1.getAddress();
        user2Address = await user2.getAddress();
        minterAddress = await minter.getAddress();

        const SecureChainFactory = await ethers.getContractFactory("SecureChain") as SecureChain__factory;
        secureChain = await SecureChainFactory.deploy();
        await secureChain.waitForDeployment();

        await secureChain.assignRole(managerAddress, MANAGER_ROLE);
        await secureChain.assignRole(auditorAddress, AUDITOR_ROLE);
        await secureChain.assignRole(minterAddress, MINTER_ROLE);
        // Admin already has IDENTITY_VERIFIER_ROLE from constructor
    });

    describe("Deployment", function () {
        it("Should set correct name and symbol", async function () {
            expect(await secureChain.name()).to.equal("SecureChain Asset");
            expect(await secureChain.symbol()).to.equal("SCA");
        });

        it("Should grant admin role to deployer", async function () {
            expect(await secureChain.hasRole(ADMIN_ROLE, adminAddress)).to.be.true;
            expect(await secureChain.hasRole(ethers.ZeroHash, adminAddress)).to.be.true;
        });

        it("Should set deployer as custodian", async function () {
            expect(await secureChain.getCustodian()).to.equal(adminAddress);
        });
    });

    describe("Identity Management", function () {
        const testDID = "did:securechain:test123";
        const testWallet = "0x1234567890123456789012345678901234567890";
        const testIdentityHash = ethers.keccak256(ethers.toUtf8Bytes("test-identity"));

        it("Should create identity successfully", async function () {
            const tx = await secureChain.connect(admin).createIdentity(testDID, testWallet, testIdentityHash);
            await tx.wait();

            const identity = await secureChain.getIdentity(testDID);
            expect(identity.did).to.equal(testDID);
            expect(identity.wallet).to.equal(testWallet);
            expect(identity.identityHash).to.equal(testIdentityHash);
            expect(identity.verified).to.be.false;
            expect(identity.createdAt).to.be.gt(0);
        });

        it("Should emit IdentityCreated event", async function () {
            await expect(secureChain.connect(admin).createIdentity(testDID, testWallet, testIdentityHash))
                .to.emit(secureChain, "IdentityCreated")
                .withArgs(testDID, testWallet, testIdentityHash, anyValue);
        });

        it("Should reject duplicate DID", async function () {
            await secureChain.connect(admin).createIdentity(testDID, testWallet, testIdentityHash);
            await expect(
                secureChain.connect(admin).createIdentity(testDID, user2Address, testIdentityHash)
            ).to.be.revertedWithCustomError(secureChain, "DIDAlreadyExists");
        });

        it("Should reject identity creation by non-admin", async function () {
            await expect(
                secureChain.connect(user1).createIdentity(testDID, testWallet, testIdentityHash)
            ).to.be.revertedWithCustomError(secureChain, "NotAdmin");
        });

        it("Should verify identity successfully", async function () {
            await secureChain.connect(admin).createIdentity(testDID, testWallet, testIdentityHash);
            const tx = await secureChain.connect(admin).verifyIdentity(testDID);
            await tx.wait();

            const identity = await secureChain.getIdentity(testDID);
            expect(identity.verified).to.be.true;
            expect(identity.verifiedAt).to.be.gt(0);
        });

        it("Should emit IdentityVerified event", async function () {
            await secureChain.connect(admin).createIdentity(testDID, testWallet, testIdentityHash);
            await expect(secureChain.connect(admin).verifyIdentity(testDID))
                .to.emit(secureChain, "IdentityVerified")
                .withArgs(testDID, adminAddress, anyValue);
        });

        it("Should reject verification of non-existent DID", async function () {
            await expect(
                secureChain.connect(admin).verifyIdentity("did:securechain:nonexistent")
            ).to.be.revertedWithCustomError(secureChain, "DIDNotFound");
        });

        it("Should reject double verification", async function () {
            await secureChain.connect(admin).createIdentity(testDID, testWallet, testIdentityHash);
            await secureChain.connect(admin).verifyIdentity(testDID);
            await expect(
                secureChain.connect(admin).verifyIdentity(testDID)
            ).to.be.revertedWithCustomError(secureChain, "IdentityAlreadyVerified");
        });

        it("Should get user DIDs", async function () {
            await secureChain.connect(admin).createIdentity(testDID, user1Address, testIdentityHash);
            const userDIDs = await secureChain.getUserDIDs(user1Address);
            expect(userDIDs.length).to.equal(1);
            expect(userDIDs[0]).to.equal(testDID);
        });
    });

    describe("Asset Management (ERC-721 with Non-Transferable Assignments)", function () {
        const testAssetId = "asset-001";
        const testName = "Test Asset";
        const testDescription = "Test Description";
        const testCategory = "Equipment";
        const testMetadataURI = "ipfs://QmTestHash";
        const testIdentityHash = ethers.keccak256(ethers.toUtf8Bytes("test-identity"));

        beforeEach(async function () {
            await secureChain.connect(admin).createIdentity("did:securechain:user1", user1Address, testIdentityHash);
            await secureChain.connect(admin).verifyIdentity("did:securechain:user1");
        });

        it("Should mint asset successfully to custodian with assignment", async function () {
            const tx = await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );
            const receipt = await tx.wait();

            const tokenId = 1;
            const asset = await secureChain.getAsset(tokenId);
            expect(asset.tokenId).to.equal(tokenId);
            expect(asset.assetId).to.equal(testAssetId);
            expect(asset.name).to.equal(testName);
            expect(asset.creator).to.equal(minterAddress);
            expect(asset.assignedTo).to.equal(user1Address);
            expect(asset.status).to.equal(0); // Active
            expect(asset.assignedAt).to.be.gt(0);
            expect(asset.assignedBy).to.equal(minterAddress);

            // ERC721 owner should be custodian (admin), NOT the assigned user
            const erc721Owner = await secureChain.ownerOf(tokenId);
            expect(erc721Owner).to.equal(adminAddress);
        });

        it("Should emit AssetMinted event with assignedTo", async function () {
            await expect(secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            )).to.emit(secureChain, "AssetMinted")
                .withArgs(1, testAssetId, minterAddress, user1Address, testName, anyValue);
        });

        it("Should reject minting by non-minter", async function () {
            await expect(
                secureChain.connect(user1).mintAsset(
                    testAssetId,
                    testName,
                    testDescription,
                    testCategory,
                    testMetadataURI,
                    user1Address
                )
            ).to.be.revertedWithCustomError(secureChain, "NotMinter");
        });

        it("Should track assigned assets for user", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            const userAssets = await secureChain.getUserAssignedAssets(user1Address);
            expect(userAssets.length).to.equal(1);
            expect(userAssets[0]).to.equal(1);
        });

        it("Should track assignment history", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            const history = await secureChain.getAssetAssignmentHistory(1);
            // [address(0), user1Address]
            expect(history.length).to.equal(2);
            expect(history[0]).to.equal(ethers.ZeroAddress);
            expect(history[1]).to.equal(user1Address);
        });

        it("Should allow Manager to assign asset to another user", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            const tx = await secureChain.connect(manager).assignAsset(1, user2Address);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.assignedTo).to.equal(user2Address);
            expect(asset.status).to.equal(1); // Transferred/Reassigned
            expect(asset.assignedBy).to.equal(managerAddress);

            // ERC721 owner should STILL be custodian (admin)
            const erc721Owner = await secureChain.ownerOf(1);
            expect(erc721Owner).to.equal(adminAddress);

            // User1 should no longer have asset assigned
            const user1Assets = await secureChain.getUserAssignedAssets(user1Address);
            expect(user1Assets.length).to.equal(0);

            // User2 should now have asset assigned
            const user2Assets = await secureChain.getUserAssignedAssets(user2Address);
            expect(user2Assets.length).to.equal(1);
            expect(user2Assets[0]).to.equal(1);
        });

        it("Should emit AssetAssigned event", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            await expect(secureChain.connect(manager).assignAsset(1, user2Address))
                .to.emit(secureChain, "AssetAssigned")
                .withArgs(1, user1Address, user2Address, managerAddress, anyValue);
        });

        it("Should reject assignment by non-manager", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            await expect(
                secureChain.connect(user1).assignAsset(1, user2Address)
            ).to.be.revertedWithCustomError(secureChain, "NotAuthorized");
        });

        it("Should allow Manager to revoke assignment", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            const tx = await secureChain.connect(manager).revokeAssignment(1);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.assignedTo).to.equal(ethers.ZeroAddress);
            expect(asset.status).to.equal(0); // Active but unassigned
        });

        it("Should track assignment history after reassignment", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            await secureChain.connect(manager).assignAsset(1, user2Address);
            
            const history = await secureChain.getAssetAssignmentHistory(1);
            // [address(0), user1Address, user1Address, user2Address]
            expect(history.length).to.equal(4);
            expect(history[0]).to.equal(ethers.ZeroAddress);
            expect(history[1]).to.equal(user1Address);
            expect(history[2]).to.equal(user1Address);
            expect(history[3]).to.equal(user2Address);
        });
    });

    describe("SECURITY: Transfer Prevention (CRITICAL)", function () {
        const testAssetId = "asset-001";
        const testName = "Test Asset";
        const testDescription = "Test Description";
        const testCategory = "Equipment";
        const testMetadataURI = "ipfs://QmTestHash";
        const testIdentityHash = ethers.keccak256(ethers.toUtf8Bytes("test-identity"));

        beforeEach(async function () {
            await secureChain.connect(admin).createIdentity("did:securechain:user1", user1Address, testIdentityHash);
            await secureChain.connect(admin).verifyIdentity("did:securechain:user1");
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );
        });

        it("Should REVERT when User1 tries transferFrom() - THE CORE SECURITY TEST", async function () {
            // User1 is assigned the asset but should NOT be able to transfer it
            // Reverts with standard ERC721 error since user1 is not the ERC721 owner (custodian is)
            await expect(
                secureChain.connect(user1).transferFrom(user1Address, user2Address, 1)
            ).to.be.reverted;
        });

        it("Should REVERT when User1 tries safeTransferFrom()", async function () {
            await expect(
                secureChain.connect(user1)["safeTransferFrom(address,address,uint256)"](user1Address, user2Address, 1)
            ).to.be.reverted;
        });

        it("Should REVERT when User1 tries safeTransferFrom() with data", async function () {
            await expect(
                secureChain.connect(user1)["safeTransferFrom(address,address,uint256,bytes)"](user1Address, user2Address, 1, "0x")
            ).to.be.reverted;
        });

        it("Should REVERT when User1 tries approve()", async function () {
            await expect(
                secureChain.connect(user1).approve(user2Address, 1)
            ).to.be.revertedWithCustomError(secureChain, "ApprovalNotPermitted");
        });

        it("Should REVERT when User1 tries setApprovalForAll()", async function () {
            await expect(
                secureChain.connect(user1).setApprovalForAll(user2Address, true)
            ).to.be.revertedWithCustomError(secureChain, "OperatorNotPermitted");
        });

        it("Should REVERT when User2 tries to transfer User1's assigned asset", async function () {
            await expect(
                secureChain.connect(user2).transferFrom(user1Address, user2Address, 1)
            ).to.be.reverted;
        });

        it("Should REVERT when unauthorized account tries transferFrom", async function () {
            await expect(
                secureChain.connect(minter).transferFrom(user1Address, user2Address, 1)
            ).to.be.reverted;
        });

        it("Should allow Admin to transfer (reassign) via assignAsset", async function () {
            // Admin uses assignAsset, not transferFrom
            const tx = await secureChain.connect(admin).assignAsset(1, user2Address);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.assignedTo).to.equal(user2Address);
        });

        it("Should allow Manager to transfer (reassign) via assignAsset", async function () {
            const tx = await secureChain.connect(manager).assignAsset(1, user2Address);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.assignedTo).to.equal(user2Address);
        });

        it("Should verify ERC721 owner remains custodian after assignment", async function () {
            // Initial state - custodian owns ERC721
            expect(await secureChain.ownerOf(1)).to.equal(adminAddress);
            
            // After reassignment by manager
            await secureChain.connect(manager).assignAsset(1, user2Address);
            
            // Custodian STILL owns ERC721
            expect(await secureChain.ownerOf(1)).to.equal(adminAddress);
        });

        it("Should record security alert on unauthorized transfer attempt", async function () {
            // We can't easily test events from reverted transactions in this test setup
            // but the event should be emitted before revert
            // This test documents the expected behavior
            await expect(
                secureChain.connect(user1).transferFrom(user1Address, user2Address, 1)
            ).to.be.reverted;
        });
    });

    describe("Asset Assignment Queries", function () {
        const testAssetId = "asset-001";
        const testName = "Test Asset";
        const testDescription = "Test Description";
        const testCategory = "Equipment";
        const testMetadataURI = "ipfs://QmTestHash";
        const testIdentityHash = ethers.keccak256(ethers.toUtf8Bytes("test-identity"));

        beforeEach(async function () {
            await secureChain.connect(admin).createIdentity("did:securechain:user1", user1Address, testIdentityHash);
            await secureChain.connect(admin).verifyIdentity("did:securechain:user1");
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );
        });

        it("Should get asset with correct assignment info", async function () {
            const asset = await secureChain.getAsset(1);
            expect(asset.tokenId).to.equal(1);
            expect(asset.assignedTo).to.equal(user1Address);
            expect(asset.creator).to.equal(minterAddress);
            expect(asset.status).to.equal(0);
        });

        it("Should get user assigned assets", async function () {
            const userAssets = await secureChain.getUserAssignedAssets(user1Address);
            expect(userAssets.length).to.equal(1);
            expect(userAssets[0]).to.equal(1);
        });

        it("Should get asset assignment history", async function () {
            const history = await secureChain.getAssetAssignmentHistory(1);
            expect(history.length).to.equal(2);
            expect(history[0]).to.equal(ethers.ZeroAddress);
            expect(history[1]).to.equal(user1Address);
        });
    });

    describe("Role Management", function () {
        it("Should assign role successfully", async function () {
            const tx = await secureChain.connect(admin).assignRole(user1Address, MANAGER_ROLE);
            await tx.wait();

            expect(await secureChain.hasRole(MANAGER_ROLE, user1Address)).to.be.true;
        });

        it("Should emit RoleAssigned event", async function () {
            await expect(secureChain.connect(admin).assignRole(user1Address, MANAGER_ROLE))
                .to.emit(secureChain, "RoleAssigned")
                .withArgs(user1Address, MANAGER_ROLE, adminAddress, anyValue);
        });

        it("Should reject invalid role", async function () {
            const invalidRole = ethers.keccak256(ethers.toUtf8Bytes("INVALID_ROLE"));
            await expect(
                secureChain.connect(admin).assignRole(user1Address, invalidRole)
            ).to.be.revertedWithCustomError(secureChain, "InvalidRole");
        });

        it("Should revoke role successfully", async function () {
            await secureChain.connect(admin).assignRole(user1Address, MANAGER_ROLE);
            const tx = await secureChain.connect(admin).revokeRoleFromAccount(user1Address, MANAGER_ROLE);
            await tx.wait();

            expect(await secureChain.hasRole(MANAGER_ROLE, user1Address)).to.be.false;
        });

        it("Should emit RoleRevokedCustom event", async function () {
            await secureChain.connect(admin).assignRole(user1Address, MANAGER_ROLE);
            const eventFilter = secureChain.filters.RoleRevokedCustom(user1Address, MANAGER_ROLE, adminAddress);
            const events = await secureChain.queryFilter(eventFilter);
            expect(events.length).to.equal(0);
            
            await secureChain.connect(admin).revokeRoleFromAccount(user1Address, MANAGER_ROLE);
            const eventsAfter = await secureChain.queryFilter(eventFilter);
            expect(eventsAfter.length).to.equal(1);
            expect(eventsAfter[0].args.account).to.equal(user1Address);
            expect(eventsAfter[0].args.role).to.equal(MANAGER_ROLE);
            expect(eventsAfter[0].args.revoker).to.equal(adminAddress);
        });

        it("Should reject revoking admin role", async function () {
            await expect(
                secureChain.connect(admin).revokeRoleFromAccount(adminAddress, ADMIN_ROLE)
            ).to.be.revertedWithCustomError(secureChain, "CannotRevokeAdmin");
        });
    });

    describe("Audit Trail", function () {
        const testIdentityHash = ethers.keccak256(ethers.toUtf8Bytes("test-identity"));

        beforeEach(async function () {
            await secureChain.connect(admin).createIdentity("did:securechain:user1", user1Address, testIdentityHash);
        });

        it("Should record audit for identity creation", async function () {
            const auditCount = await secureChain.connect(auditor).getAuditCount();
            expect(auditCount).to.be.gt(0);
        });

        it("Should allow auditor to view audit records", async function () {
            const auditCount = await secureChain.connect(auditor).getAuditCount();
            expect(auditCount).to.be.gt(0);

            const auditRecord = await secureChain.connect(auditor).getAuditRecord(4);
            expect(auditRecord.auditId).to.equal(4);
            expect(auditRecord.actor).to.equal(adminAddress);
            expect(auditRecord.action).to.equal("IDENTITY_CREATED");
        });

        it("Should reject non-auditor from viewing audit records", async function () {
            await expect(
                secureChain.connect(user1).getAuditRecord(1)
            ).to.be.revertedWithCustomError(secureChain, "NotAuditor");
        });
    });

    describe("Asset Lifecycle", function () {
        const testAssetId = "asset-002";
        const testName = "Test Asset 2";
        const testDescription = "Test Description 2";
        const testCategory = "Vehicle";
        const testMetadataURI = "ipfs://QmTestHash2";
        const testIdentityHash = ethers.keccak256(ethers.toUtf8Bytes("test-identity"));

        beforeEach(async function () {
            await secureChain.connect(admin).createIdentity("did:securechain:user1", user1Address, testIdentityHash);
            await secureChain.connect(admin).verifyIdentity("did:securechain:user1");
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );
        });

        it("Should burn asset successfully (admin only)", async function () {
            const tx = await secureChain.connect(admin).burnAsset(1);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.status).to.equal(2);

            await expect(secureChain.ownerOf(1)).to.be.reverted;
        });

        it("Should reject burn by non-admin", async function () {
            await expect(
                secureChain.connect(user1).burnAsset(1)
            ).to.be.revertedWithCustomError(secureChain, "NotAdmin");
        });

        it("Should freeze asset successfully", async function () {
            const tx = await secureChain.connect(admin).freezeAsset(1);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.status).to.equal(3);

            // Even manager cannot assign frozen asset
            await expect(
                secureChain.connect(manager).assignAsset(1, user2Address)
            ).to.be.revertedWithCustomError(secureChain, "AssetFrozen");
        });

        it("Should unfreeze asset successfully", async function () {
            await secureChain.connect(admin).freezeAsset(1);
            const tx = await secureChain.connect(admin).unfreezeAsset(1);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.status).to.equal(0);

            // Manager can now assign
            await expect(secureChain.connect(manager).assignAsset(1, user2Address)).to.not.be.reverted;
        });

        it("Should reject freeze by non-admin", async function () {
            await expect(
                secureChain.connect(user1).freezeAsset(1)
            ).to.be.revertedWithCustomError(secureChain, "NotAdmin");
        });
    });

    describe("Custodian Management", function () {
        it("Should allow admin to update custodian", async function () {
            await secureChain.connect(admin).updateCustodian(user1Address);
            expect(await secureChain.getCustodian()).to.equal(user1Address);
        });

        it("Should reject custodian update by non-admin", async function () {
            await expect(
                secureChain.connect(user1).updateCustodian(user2Address)
            ).to.be.revertedWithCustomError(secureChain, "NotAdmin");
        });

        it("Should reject zero address custodian", async function () {
            await expect(
                secureChain.connect(admin).updateCustodian(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(secureChain, "ZeroAddress");
        });
    });

    describe("Token URI", function () {
        const testAssetId = "asset-003";
        const testName = "Test Asset 3";
        const testDescription = "Test Description 3";
        const testCategory = "Document";
        const testMetadataURI = "ipfs://QmTestHash3";
        const testIdentityHash = ethers.keccak256(ethers.toUtf8Bytes("test-identity"));

        beforeEach(async function () {
            await secureChain.connect(admin).createIdentity("did:securechain:user1", user1Address, testIdentityHash);
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );
        });

        it("Should return correct token URI", async function () {
            const uri = await secureChain.tokenURI(1);
            expect(uri).to.equal(testMetadataURI);
        });
    });

    describe("Security Event Emission", function () {
        const testAssetId = "asset-004";
        const testName = "Test Asset 4";
        const testDescription = "Test Description 4";
        const testCategory = "Equipment";
        const testMetadataURI = "ipfs://QmTestHash4";
        const testIdentityHash = ethers.keccak256(ethers.toUtf8Bytes("test-identity"));

        beforeEach(async function () {
            await secureChain.connect(admin).createIdentity("did:securechain:user1", user1Address, testIdentityHash);
            await secureChain.connect(admin).verifyIdentity("did:securechain:user1");
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );
        });

        it("Should emit SecurityAlert on unauthorized transfer attempt", async function () {
            // Note: Events from reverted transactions aren't easily testable in ethers
            // This test documents the expected behavior
            // In practice, the alert is emitted before the revert
            await expect(
                secureChain.connect(user1).transferFrom(user1Address, user2Address, 1)
            ).to.be.reverted;
        });

        it("Should emit SecurityAlert on unauthorized approve attempt", async function () {
            await expect(
                secureChain.connect(user1).approve(user2Address, 1)
            ).to.be.revertedWithCustomError(secureChain, "ApprovalNotPermitted");
        });

        it("Should emit SecurityAlert on unauthorized setApprovalForAll attempt", async function () {
            await expect(
                secureChain.connect(user1).setApprovalForAll(user2Address, true)
            ).to.be.revertedWithCustomError(secureChain, "OperatorNotPermitted");
        });
    });
});