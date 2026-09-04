// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SecureChain
 * @dev Decentralized Identity, NFT Asset Ownership & Immutable Audit Platform
 * Implements DID management, ERC-721 NFT assets with non-transferable assignments,
 * role-based access control, and audit trails.
 * 
 * SECURITY CRITICAL: Users assigned assets CANNOT transfer them.
 * Assignment ≠ ERC721 ownership. The contract retains ERC721 ownership.
 * Only ADMIN/MANAGER can assign/reassign assets.
 */
contract SecureChain is ERC721, AccessControl {
    using Strings for uint256;

    // Custom Errors
    error NotAdmin();
    error NotManager();
    error NotAuditor();
    error NotMinter();
    error NotIdentityVerifier();
    error NotAuthorized();

    error EmptyDID();
    error ZeroAddress();
    error DIDAlreadyExists();
    error ZeroIdentityHash();
    error DIDNotFound();
    error IdentityAlreadyVerified();

    error EmptyAssetId();
    error EmptyName();
    error AssetNotFound();
    error AssetUnavailable();
    error AssetBurned();
    error AssetFrozen();
    error SelfTransfer();
    error AlreadyBurned();
    error AlreadyFrozen();
    error NotFrozen();

    error InvalidRole();
    error RoleAlreadyAssigned();
    error RoleNotAssigned();
    error CannotRevokeAdmin();

    error TransferNotPermitted();
    error ApprovalNotPermitted();
    error OperatorNotPermitted();

    // Role Constants
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant IDENTITY_VERIFIER_ROLE = keccak256("IDENTITY_VERIFIER_ROLE");

    // State Variables
    uint256 private _tokenIdCounter;
    uint256 private _auditCounter;
    address private _custodian;

    // Identity
    struct Identity {
        string did;
        address wallet;
        bytes32 identityHash;
        bool verified;
        uint256 createdAt;
        uint256 verifiedAt;
        string verificationTxHash;
    }

    // Asset - assignment tracked separately from ERC721 ownership
    struct Asset {
        uint256 tokenId;
        string assetId;
        string name;
        string description;
        string category;
        string metadataURI;
        address creator;
        address assignedTo;      // Employee/user assigned to this asset (NOT ERC721 owner)
        uint256 createdAt;
        uint8 status;            // 0: Active, 1: Transferred/Reassigned, 2: Burned, 3: Frozen
        string mintTxHash;
        uint256 assignedAt;
        address assignedBy;
    }

    struct AuditRecord {
        uint256 auditId;
        address actor;
        string action;
        string resourceType;
        string resourceId;
        bytes32 role;
        string txHash;
        uint256 blockNumber;
        uint256 timestamp;
        bool verified;
    }

    // Mappings
    mapping(string => Identity) public identities;
    mapping(string => bool) public didExists;
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => AuditRecord) public auditRecords;
    mapping(address => string[]) public userDIDs;
    mapping(address => uint256[]) public userAssignedAssets;  // Tracks assigned assets per user
    mapping(uint256 => address[]) public assetAssignmentHistory; // Tracks assignment history

    // Events
    event IdentityCreated(
        string indexed did,
        address indexed wallet,
        bytes32 identityHash,
        uint256 timestamp
    );

    event IdentityVerified(
        string indexed did,
        address indexed verifier,
        uint256 timestamp
    );

    event AssetMinted(
        uint256 indexed tokenId,
        string indexed assetId,
        address indexed creator,
        address assignedTo,
        string name,
        uint256 timestamp
    );

    event AssetAssigned(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        address assignedBy,
        uint256 timestamp
    );

    event RoleAssigned(
        address indexed account,
        bytes32 indexed role,
        address indexed assigner,
        uint256 timestamp
    );

    event RoleRevokedCustom(
        address indexed account,
        bytes32 indexed role,
        address indexed revoker,
        uint256 timestamp
    );

    event AuditRecorded(
        uint256 indexed auditId,
        address indexed actor,
        string action,
        string resourceType,
        string resourceId,
        bytes32 role,
        uint256 blockNumber,
        uint256 timestamp
    );

    event SecurityAlert(
        uint256 indexed alertId,
        address indexed actor,
        string action,
        string resourceType,
        string resourceId,
        string reason,
        uint256 timestamp
    );

    event CustodianUpdated(address indexed oldCustodian, address indexed newCustodian);

    constructor() ERC721("SecureChain Asset", "SCA") AccessControl() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(IDENTITY_VERIFIER_ROLE, msg.sender);
        _custodian = msg.sender; // Contract deployer is initial custodian
    }

    // ==================== MODIFIERS ====================

    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) revert NotAdmin();
        _;
    }

    modifier onlyManager() {
        if (!hasRole(MANAGER_ROLE, msg.sender)) revert NotManager();
        _;
    }

    modifier onlyAuditor() {
        if (!hasRole(AUDITOR_ROLE, msg.sender)) revert NotAuditor();
        _;
    }

    modifier onlyMinter() {
        if (!hasRole(MINTER_ROLE, msg.sender)) revert NotMinter();
        _;
    }

    modifier onlyIdentityVerifier() {
        if (!hasRole(IDENTITY_VERIFIER_ROLE, msg.sender)) revert NotIdentityVerifier();
        _;
    }

    modifier onlyAuthorizedForAssignment(uint256 tokenId) {
        if (
            !hasRole(MANAGER_ROLE, msg.sender) &&
            !hasRole(ADMIN_ROLE, msg.sender)
        ) {
            revert NotAuthorized();
        }
        _;
    }

    // ==================== INTERNAL HELPERS ====================

    function _incrementTokenId() internal returns (uint256) {
        _tokenIdCounter += 1;
        return _tokenIdCounter;
    }

    function _incrementAuditId() internal returns (uint256) {
        _auditCounter += 1;
        return _auditCounter;
    }

    function _recordAudit(
        string memory action,
        string memory resourceType,
        string memory resourceId,
        bytes32 role
    ) internal returns (uint256) {
        uint256 auditId = _incrementAuditId();

        auditRecords[auditId] = AuditRecord({
            auditId: auditId,
            actor: msg.sender,
            action: action,
            resourceType: resourceType,
            resourceId: resourceId,
            role: role,
            txHash: "",
            blockNumber: block.number,
            timestamp: block.timestamp,
            verified: true
        });

        emit AuditRecorded(
            auditId,
            msg.sender,
            action,
            resourceType,
            resourceId,
            role,
            block.number,
            block.timestamp
        );

        return auditId;
    }

    function _recordSecurityAlert(
        string memory action,
        string memory resourceType,
        string memory resourceId,
        string memory reason
    ) internal {
        emit SecurityAlert(
            _incrementAuditId(),
            msg.sender,
            action,
            resourceType,
            resourceId,
            reason,
            block.timestamp
        );
    }

    function _addAssignedAsset(address user, uint256 tokenId) internal {
        userAssignedAssets[user].push(tokenId);
    }

    function _removeAssignedAsset(address user, uint256 tokenId) internal {
        uint256[] storage arr = userAssignedAssets[user];
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == tokenId) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }

    function _removeFromArray(uint256[] storage arr, uint256 value) internal {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == value) {
                arr[i] = arr[arr.length - 1];
                arr.pop();
                break;
            }
        }
    }

    // ==================== ERC721 OVERRIDES - CRITICAL SECURITY ====================

    /**
     * @dev Override _transfer to BLOCK all transfers except by custodian (ADMIN/MANAGER via assignAsset).
     * This is the core security enforcement: users CANNOT transfer assigned assets.
     */
    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        // Allow minting (from == address(0)) and burning (to == address(0))
        if (from == address(0)) {
            super._transfer(from, to, tokenId);
            return;
        }
        
        if (to == address(0)) {
            // Burning - only allow if authorized for asset
            if (assets[tokenId].tokenId != 0) {
                if (
                    !hasRole(ADMIN_ROLE, msg.sender) &&
                    !hasRole(MANAGER_ROLE, msg.sender) &&
                    assets[tokenId].assignedTo != msg.sender
                ) {
                    revert NotAuthorized();
                }
            }
            super._transfer(from, to, tokenId);
            return;
        }

        // TRANSFER ATTEMPT - BLOCK unless authorized
        // Only custodian (contract) or ADMIN/MANAGER can move tokens
        if (msg.sender != _custodian && !hasRole(ADMIN_ROLE, msg.sender) && !hasRole(MANAGER_ROLE, msg.sender)) {
            // Record security alert for unauthorized transfer attempt
            _recordSecurityAlert(
                "UNAUTHORIZED_TRANSFER_ATTEMPT",
                "ASSET",
                tokenId.toString(),
                "User attempted to transfer assigned asset via ERC721 transfer function"
            );
            revert TransferNotPermitted();
        }

        // If transferring TO a user (assignment), update assignment tracking
        if (to != address(0) && to != _custodian) {
            // This is an assignment - update tracking
            address previousAssigned = assets[tokenId].assignedTo;
            if (previousAssigned != address(0)) {
                _removeAssignedAsset(previousAssigned, tokenId);
            }
            assets[tokenId].assignedTo = to;
            assets[tokenId].assignedAt = block.timestamp;
            assets[tokenId].assignedBy = msg.sender;
            _addAssignedAsset(to, tokenId);
            assetAssignmentHistory[tokenId].push(previousAssigned);
            assetAssignmentHistory[tokenId].push(to);
        }
        // If transferring FROM a user (revocation), clear assignment
        else if (from != address(0) && from != _custodian) {
            _removeAssignedAsset(from, tokenId);
            assets[tokenId].assignedTo = address(0);
            assets[tokenId].assignedAt = 0;
            assets[tokenId].assignedBy = address(0);
        }

        super._transfer(from, to, tokenId);
    }

    /**
     * @dev Override _mint to track assignment when minting to custodian.
     */
    function _mint(address to, uint256 tokenId) internal override {
        super._mint(to, tokenId);
        // If minting to custodian with an assignee, track it
        if (to == _custodian && assets[tokenId].tokenId != 0) {
            address assignee = assets[tokenId].assignedTo;
            if (assignee != address(0)) {
                _addAssignedAsset(assignee, tokenId);
                assetAssignmentHistory[tokenId].push(address(0));
                assetAssignmentHistory[tokenId].push(assignee);
            }
        }
    }

    /**
     * @dev Override _burn to clean up assignment tracking.
     */
    function _burn(uint256 tokenId) internal override {
        address assigned = assets[tokenId].assignedTo;
        if (assigned != address(0)) {
            _removeAssignedAsset(assigned, tokenId);
        }
        super._burn(tokenId);
    }

    /**
     * @dev Override approve to BLOCK approvals by assigned users.
     * Users cannot approve others to transfer their assigned assets.
     */
    function approve(address to, uint256 tokenId) public override {
        // Check if caller is ADMIN/MANAGER
        if (hasRole(ADMIN_ROLE, msg.sender) || hasRole(MANAGER_ROLE, msg.sender)) {
            super.approve(to, tokenId);
            return;
        }

        // Check if caller is the ERC721 owner (custodian)
        if (ownerOf(tokenId) == msg.sender) {
            super.approve(to, tokenId);
            return;
        }

        // BLOCK: Assigned user trying to approve
        _recordSecurityAlert(
            "UNAUTHORIZED_APPROVE_ATTEMPT",
            "ASSET",
            tokenId.toString(),
            "Assigned user attempted to approve transfer of assigned asset"
        );
        revert ApprovalNotPermitted();
    }

    /**
     * @dev Override setApprovalForAll to BLOCK operators for assigned users.
     * Users cannot set operators for their assigned assets.
     */
    function setApprovalForAll(address operator, bool approved) public override {
        // Check if caller has ADMIN/MANAGER role or is custodian
        if (msg.sender == _custodian || hasRole(ADMIN_ROLE, msg.sender) || hasRole(MANAGER_ROLE, msg.sender)) {
            super.setApprovalForAll(operator, approved);
            return;
        }

        // BLOCK: Any other attempt to set approval for all
        // Assigned users should never be able to set operators
        _recordSecurityAlert(
            "UNAUTHORIZED_OPERATOR_ATTEMPT",
            "ASSET",
            "MULTIPLE",
            "User attempted to set approval for all without authorization"
        );
        revert OperatorNotPermitted();
    }

    // ==================== IDENTITY MANAGEMENT ====================

    function createIdentity(
        string calldata did,
        address wallet,
        bytes32 identityHash
    ) external onlyAdmin returns (bool) {
        if (bytes(did).length == 0) revert EmptyDID();
        if (wallet == address(0)) revert ZeroAddress();
        if (didExists[did]) revert DIDAlreadyExists();
        if (identityHash == bytes32(0)) revert ZeroIdentityHash();

        Identity memory identity = Identity({
            did: did,
            wallet: wallet,
            identityHash: identityHash,
            verified: false,
            createdAt: block.timestamp,
            verifiedAt: 0,
            verificationTxHash: ""
        });

        identities[did] = identity;
        didExists[did] = true;
        userDIDs[wallet].push(did);

        _recordAudit("IDENTITY_CREATED", "DID", did, ADMIN_ROLE);

        emit IdentityCreated(did, wallet, identityHash, block.timestamp);

        return true;
    }

    function verifyIdentity(string calldata did) external onlyIdentityVerifier returns (bool) {
        if (!didExists[did]) revert DIDNotFound();
        if (identities[did].verified) revert IdentityAlreadyVerified();

        identities[did].verified = true;
        identities[did].verifiedAt = block.timestamp;
        identities[did].verificationTxHash = "";

        _recordAudit("IDENTITY_VERIFIED", "DID", did, IDENTITY_VERIFIER_ROLE);

        emit IdentityVerified(did, msg.sender, block.timestamp);

        return true;
    }

    function getIdentity(string calldata did) external view returns (Identity memory) {
        if (!didExists[did]) revert DIDNotFound();
        return identities[did];
    }

    function getUserDIDs(address user) external view returns (string[] memory) {
        return userDIDs[user];
    }

    // ==================== ASSET MANAGEMENT ====================

    function mintAsset(
        string calldata assetId,
        string calldata name,
        string calldata description,
        string calldata category,
        string calldata metadataURI,
        address initialAssignee
    ) external onlyMinter returns (uint256) {
        if (bytes(assetId).length == 0) revert EmptyAssetId();
        if (bytes(name).length == 0) revert EmptyName();
        if (initialAssignee == address(0)) revert ZeroAddress();

        uint256 tokenId = _incrementTokenId();

        // Mint to custodian (contract retains ERC721 ownership)
        _safeMint(_custodian, tokenId);

        Asset memory asset = Asset({
            tokenId: tokenId,
            assetId: assetId,
            name: name,
            description: description,
            category: category,
            metadataURI: metadataURI,
            creator: msg.sender,
            assignedTo: initialAssignee,
            createdAt: block.timestamp,
            status: 0, // Active
            mintTxHash: "",
            assignedAt: block.timestamp,
            assignedBy: msg.sender
        });

        assets[tokenId] = asset;
        _addAssignedAsset(initialAssignee, tokenId);
        assetAssignmentHistory[tokenId].push(address(0));
        assetAssignmentHistory[tokenId].push(initialAssignee);

        _recordAudit("ASSET_MINTED", "ASSET", tokenId.toString(), MINTER_ROLE);

        emit AssetMinted(tokenId, assetId, msg.sender, initialAssignee, name, block.timestamp);

        return tokenId;
    }

    /**
     * @dev Assign/reassign asset to a user. Only MANAGER/ADMIN.
     * This is the ONLY way to change asset assignment.
     * Does NOT transfer ERC721 ownership - custodian retains it.
     */
    function assignAsset(uint256 tokenId, address to) external onlyAuthorizedForAssignment(tokenId) returns (bool) {
        if (to == address(0)) revert ZeroAddress();
        if (assets[tokenId].tokenId == 0) revert AssetNotFound();
        if (assets[tokenId].status == 2) revert AssetBurned();
        if (assets[tokenId].status == 3) revert AssetFrozen();

        address from = assets[tokenId].assignedTo;
        if (from == to) revert SelfTransfer();

        // Update assignment tracking
        if (from != address(0)) {
            _removeAssignedAsset(from, tokenId);
        }
        assets[tokenId].assignedTo = to;
        assets[tokenId].assignedAt = block.timestamp;
        assets[tokenId].assignedBy = msg.sender;
        assets[tokenId].status = 1; // Transferred/Reassigned
        _addAssignedAsset(to, tokenId);
        assetAssignmentHistory[tokenId].push(from);
        assetAssignmentHistory[tokenId].push(to);

        _recordAudit("ASSET_ASSIGNED", "ASSET", tokenId.toString(),
            hasRole(ADMIN_ROLE, msg.sender) ? ADMIN_ROLE : MANAGER_ROLE);

        emit AssetAssigned(tokenId, from, to, msg.sender, block.timestamp);

        return true;
    }

    /**
     * @dev Revoke assignment from current user. Only MANAGER/ADMIN.
     * Sets assignment to address(0) - asset becomes unassigned.
     */
    function revokeAssignment(uint256 tokenId) external onlyAuthorizedForAssignment(tokenId) returns (bool) {
        if (assets[tokenId].tokenId == 0) revert AssetNotFound();
        if (assets[tokenId].status == 2) revert AssetBurned();
        if (assets[tokenId].status == 3) revert AssetFrozen();

        address from = assets[tokenId].assignedTo;
        if (from == address(0)) {
            // Already unassigned
            return true;
        }

        _removeAssignedAsset(from, tokenId);
        assets[tokenId].assignedTo = address(0);
        assets[tokenId].assignedAt = 0;
        assets[tokenId].assignedBy = address(0);
        assets[tokenId].status = 0; // Active but unassigned
        assetAssignmentHistory[tokenId].push(from);
        assetAssignmentHistory[tokenId].push(address(0));

        _recordAudit("ASSET_REVOKED", "ASSET", tokenId.toString(),
            hasRole(ADMIN_ROLE, msg.sender) ? ADMIN_ROLE : MANAGER_ROLE);

        emit AssetAssigned(tokenId, from, address(0), msg.sender, block.timestamp);

        return true;
    }

    function getAsset(uint256 tokenId) external view returns (Asset memory) {
        if (assets[tokenId].tokenId == 0) revert AssetNotFound();
        return assets[tokenId];
    }

    function getUserAssignedAssets(address user) external view returns (uint256[] memory) {
        return userAssignedAssets[user];
    }

    function getAssetAssignmentHistory(uint256 tokenId) external view returns (address[] memory) {
        return assetAssignmentHistory[tokenId];
    }

    function getCustodian() external view returns (address) {
        return _custodian;
    }

    function updateCustodian(address newCustodian) external onlyAdmin {
        if (newCustodian == address(0)) revert ZeroAddress();
        address oldCustodian = _custodian;
        _custodian = newCustodian;
        emit CustodianUpdated(oldCustodian, newCustodian);
    }

    // ==================== ROLE MANAGEMENT ====================

    function assignRole(address account, bytes32 role) external onlyAdmin returns (bool) {
        if (account == address(0)) revert ZeroAddress();
        if (
            role != MANAGER_ROLE && role != AUDITOR_ROLE && role != MINTER_ROLE && role != IDENTITY_VERIFIER_ROLE
        ) {
            revert InvalidRole();
        }
        if (hasRole(role, account)) revert RoleAlreadyAssigned();

        _grantRole(role, account);

        _recordAudit("ROLE_ASSIGNED", "ROLE", Strings.toHexString(uint160(account), 20), role);

        emit RoleAssigned(account, role, msg.sender, block.timestamp);

        return true;
    }

    function revokeRoleFromAccount(address account, bytes32 role) external onlyAdmin returns (bool) {
        if (account == address(0)) revert ZeroAddress();
        if (!hasRole(role, account)) revert RoleNotAssigned();
        if (role == ADMIN_ROLE) revert CannotRevokeAdmin();

        _revokeRole(role, account);

        _recordAudit("ROLE_REVOKED", "ROLE", Strings.toHexString(uint160(account), 20), role);

        emit RoleRevokedCustom(account, role, msg.sender, block.timestamp);

        return true;
    }

    // ==================== AUDIT TRAIL ====================

    function getAuditRecord(uint256 auditId) external view onlyAuditor returns (AuditRecord memory) {
        return auditRecords[auditId];
    }

    function getAuditCount() external view onlyAuditor returns (uint256) {
        return _auditCounter;
    }

    // ==================== ASSET LIFECYCLE ====================

    function burnAsset(uint256 tokenId) external onlyAdmin returns (bool) {
        if (assets[tokenId].tokenId == 0) revert AssetNotFound();
        if (assets[tokenId].status == 2) revert AlreadyBurned();

        address assigned = assets[tokenId].assignedTo;
        if (assigned != address(0)) {
            _removeAssignedAsset(assigned, tokenId);
        }

        _burn(tokenId);
        assets[tokenId].status = 2;

        _recordAudit("ASSET_BURNED", "ASSET", tokenId.toString(), ADMIN_ROLE);

        return true;
    }

    function freezeAsset(uint256 tokenId) external onlyAdmin returns (bool) {
        if (assets[tokenId].tokenId == 0) revert AssetNotFound();
        if (assets[tokenId].status == 3) revert AlreadyFrozen();

        assets[tokenId].status = 3;

        _recordAudit("ASSET_FROZEN", "ASSET", tokenId.toString(), ADMIN_ROLE);

        return true;
    }

    function unfreezeAsset(uint256 tokenId) external onlyAdmin returns (bool) {
        if (assets[tokenId].tokenId == 0) revert AssetNotFound();
        if (assets[tokenId].status != 3) revert NotFrozen();

        assets[tokenId].status = 0;

        _recordAudit("ASSET_UNFROZEN", "ASSET", tokenId.toString(), ADMIN_ROLE);

        return true;
    }

    // ==================== ERC721 METADATA ====================

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        if (assets[tokenId].tokenId == 0) revert AssetNotFound();
        return assets[tokenId].metadataURI;
    }

    // ==================== INTERFACE SUPPORT ====================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}