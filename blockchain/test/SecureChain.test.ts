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
            ).to.be.revertedWith("SecureChain: DID already exists");
        });

        it("Should reject identity creation by non-admin", async function () {
            await expect(
                secureChain.connect(user1).createIdentity(testDID, testWallet, testIdentityHash)
            ).to.be.revertedWith("SecureChain: caller is not admin");
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
            ).to.be.revertedWith("SecureChain: DID does not exist");
        });

        it("Should reject double verification", async function () {
            await secureChain.connect(admin).createIdentity(testDID, testWallet, testIdentityHash);
            await secureChain.connect(admin).verifyIdentity(testDID);
            await expect(
                secureChain.connect(admin).verifyIdentity(testDID)
            ).to.be.revertedWith("SecureChain: identity already verified");
        });

        it("Should get user DIDs", async function () {
            await secureChain.connect(admin).createIdentity(testDID, user1Address, testIdentityHash);
            const userDIDs = await secureChain.getUserDIDs(user1Address);
            expect(userDIDs.length).to.equal(1);
            expect(userDIDs[0]).to.equal(testDID);
        });
    });

    describe("Asset Management (ERC-721)", function () {
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

        it("Should mint asset successfully", async function () {
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
            expect(asset.currentOwner).to.equal(user1Address);
            expect(asset.status).to.equal(0);
        });

        it("Should emit AssetMinted event", async function () {
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
            ).to.be.revertedWith("SecureChain: caller is not minter");
        });

        it("Should allocate asset successfully", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            const tx = await secureChain.connect(manager).allocateAsset(1, user2Address);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.currentOwner).to.equal(user2Address);
            expect(asset.status).to.equal(1);

            const owner = await secureChain.ownerOf(1);
            expect(owner).to.equal(user2Address);
        });

        it("Should emit AssetAllocated event", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            await expect(secureChain.connect(manager).allocateAsset(1, user2Address))
                .to.emit(secureChain, "AssetAllocated")
                .withArgs(1, user1Address, user2Address, anyValue);
        });

        it("Should reject allocation by non-manager", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            await expect(
                secureChain.connect(user1).allocateAsset(1, user2Address)
            ).to.be.revertedWith("SecureChain: caller is not manager");
        });

        it("Should transfer asset successfully", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            const tx = await secureChain.connect(user1).transferAsset(1, user2Address);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.currentOwner).to.equal(user2Address);
            expect(asset.status).to.equal(1);

            const owner = await secureChain.ownerOf(1);
            expect(owner).to.equal(user2Address);
        });

        it("Should emit AssetTransferred event", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            await expect(secureChain.connect(user1).transferAsset(1, user2Address))
                .to.emit(secureChain, "AssetTransferred")
                .withArgs(1, user1Address, user2Address, anyValue);
        });

        it("Should reject transfer to self", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            await expect(
                secureChain.connect(user1).transferAsset(1, user1Address)
            ).to.be.revertedWith("SecureChain: cannot transfer to self");
        });

        it("Should reject unauthorized transfer", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            await expect(
                secureChain.connect(user2).transferAsset(1, user2Address)
            ).to.be.revertedWith("SecureChain: not authorized for this asset");
        });

        it("Should get user assets", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            const userAssets = await secureChain.getUserAssets(user1Address);
            expect(userAssets.length).to.equal(1);
            expect(userAssets[0]).to.equal(1);
        });

        it("Should track transfer history", async function () {
            await secureChain.connect(minter).mintAsset(
                testAssetId,
                testName,
                testDescription,
                testCategory,
                testMetadataURI,
                user1Address
            );

            await secureChain.connect(user1).transferAsset(1, user2Address);
            const history = await secureChain.getAssetTransferHistory(1);
            expect(history.length).to.equal(2);
            expect(history[0]).to.equal(user1Address);
            expect(history[1]).to.equal(user2Address);
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
            ).to.be.revertedWith("SecureChain: invalid role");
        });

        it("Should revoke role successfully", async function () {
            await secureChain.connect(admin).assignRole(user1Address, MANAGER_ROLE);
            const tx = await secureChain.connect(admin).revokeRoleFromAccount(user1Address, MANAGER_ROLE);
            await tx.wait();

            expect(await secureChain.hasRole(MANAGER_ROLE, user1Address)).to.be.false;
        });

        it("Should emit RoleRevoked event", async function () {
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
            ).to.be.revertedWith("SecureChain: cannot revoke admin role");
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

            // First audit is ROLE_ASSIGNED for manager, then auditor, then minter
            // Then IDENTITY_CREATED is the 4th audit
            const auditRecord = await secureChain.connect(auditor).getAuditRecord(4);
            expect(auditRecord.auditId).to.equal(4);
            expect(auditRecord.actor).to.equal(adminAddress);
            expect(auditRecord.action).to.equal("IDENTITY_CREATED");
        });

        it("Should reject non-auditor from viewing audit records", async function () {
            await expect(
                secureChain.connect(user1).getAuditRecord(1)
            ).to.be.revertedWith("SecureChain: caller is not auditor");
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

        it("Should burn asset successfully", async function () {
            const tx = await secureChain.connect(user1).burnAsset(1);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.status).to.equal(2);

            await expect(secureChain.ownerOf(1)).to.be.reverted;
        });

        it("Should freeze asset successfully", async function () {
            const tx = await secureChain.connect(admin).freezeAsset(1);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.status).to.equal(3);

            await expect(
                secureChain.connect(user1).transferAsset(1, user2Address)
            ).to.be.revertedWith("SecureChain: asset is frozen");
        });

        it("Should unfreeze asset successfully", async function () {
            await secureChain.connect(admin).freezeAsset(1);
            const tx = await secureChain.connect(admin).unfreezeAsset(1);
            await tx.wait();

            const asset = await secureChain.getAsset(1);
            expect(asset.status).to.equal(0);

            await expect(secureChain.connect(user1).transferAsset(1, user2Address)).to.not.be.reverted;
        });

        it("Should reject freeze by non-admin", async function () {
            await expect(
                secureChain.connect(user1).freezeAsset(1)
            ).to.be.revertedWith("SecureChain: caller is not admin");
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
});