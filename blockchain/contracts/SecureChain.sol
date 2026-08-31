// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SecureChain
 * @dev Decentralized Identity, NFT Asset Ownership & Immutable Audit Platform
 * Implements DID management, ERC-721 NFT assets, role-based access control, and audit trails
 */
contract SecureChain is ERC721, ERC721URIStorage, AccessControl {
    using Strings for uint256;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant IDENTITY_VERIFIER_ROLE = keccak256("IDENTITY_VERIFIER_ROLE");

    uint256 private _tokenIdCounter;
    uint256 private _identityCounter;
    uint256 private _auditCounter;

    struct Identity {
        string did;
        address wallet;
        bytes32 identityHash;
        bool verified;
        uint256 createdAt;
        uint256 verifiedAt;
        string verificationTxHash;
    }

    struct Asset {
        uint256 tokenId;
        string assetId;
        string name;
        string description;
        string category;
        string metadataURI;
        address creator;
        address currentOwner;
        uint256 createdAt;
        uint8 status; // 0: Active, 1: Transferred, 2: Burned, 3: Frozen
        string mintTxHash;
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

    mapping(string => Identity) public identities;
    mapping(string => bool) public didExists;
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => AuditRecord) public auditRecords;
    mapping(address => string[]) public userDIDs;
    mapping(address => uint256[]) public userAssets;
    mapping(uint256 => address[]) public assetTransferHistory;

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
        address owner,
        string name,
        uint256 timestamp
    );

    event AssetAllocated(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    event AssetTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
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

    constructor() ERC721("SecureChain Asset", "SCA") AccessControl() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(IDENTITY_VERIFIER_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "SecureChain: caller is not admin");
        _;
    }

    modifier onlyManager() {
        require(hasRole(MANAGER_ROLE, msg.sender), "SecureChain: caller is not manager");
        _;
    }

    modifier onlyAuditor() {
        require(hasRole(AUDITOR_ROLE, msg.sender), "SecureChain: caller is not auditor");
        _;
    }

    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "SecureChain: caller is not minter");
        _;
    }

    modifier onlyIdentityVerifier() {
        require(hasRole(IDENTITY_VERIFIER_ROLE, msg.sender), "SecureChain: caller is not identity verifier");
        _;
    }

    modifier onlyAuthorizedForAsset(uint256 tokenId) {
        require(
            ownerOf(tokenId) == msg.sender || hasRole(MANAGER_ROLE, msg.sender) || hasRole(ADMIN_ROLE, msg.sender),
            "SecureChain: not authorized for this asset"
        );
        _;
    }

    function _incrementTokenId() internal returns (uint256) {
        _tokenIdCounter += 1;
        return _tokenIdCounter;
    }

    function _incrementAuditId() internal returns (uint256) {
        _auditCounter += 1;
        return _auditCounter;
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        uint160 addrUint = uint160(addr);
        bytes memory buffer = new bytes(42);
        buffer[0] = '0';
        buffer[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            uint8 byteVal = uint8((addrUint >> (8 * (19 - i))) & 0xFF);
            uint8 high = byteVal >> 4;
            uint8 low = byteVal & 0x0f;
            buffer[2 + 2 * i] = high < 10 ? bytes1(uint8(high) + 48) : bytes1(uint8(high) + 87);
            buffer[3 + 2 * i] = low < 10 ? bytes1(uint8(low) + 48) : bytes1(uint8(low) + 87);
        }
        return string(buffer);
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

    function createIdentity(
        string calldata did,
        address wallet,
        bytes32 identityHash
    ) external onlyAdmin returns (bool) {
        require(bytes(did).length > 0, "SecureChain: DID cannot be empty");
        require(wallet != address(0), "SecureChain: wallet cannot be zero address");
        require(!didExists[did], "SecureChain: DID already exists");
        require(identityHash != bytes32(0), "SecureChain: identity hash cannot be zero");

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
        require(didExists[did], "SecureChain: DID does not exist");
        require(!identities[did].verified, "SecureChain: identity already verified");

        identities[did].verified = true;
        identities[did].verifiedAt = block.timestamp;
        identities[did].verificationTxHash = "";

        _recordAudit("IDENTITY_VERIFIED", "DID", did, IDENTITY_VERIFIER_ROLE);

        emit IdentityVerified(did, msg.sender, block.timestamp);

        return true;
    }

    function getIdentity(string calldata did) external view returns (Identity memory) {
        require(didExists[did], "SecureChain: DID does not exist");
        return identities[did];
    }

    function getUserDIDs(address user) external view returns (string[] memory) {
        return userDIDs[user];
    }

    function mintAsset(
        string calldata assetId,
        string calldata name,
        string calldata description,
        string calldata category,
        string calldata metadataURI,
        address initialOwner
    ) external onlyMinter returns (uint256) {
        require(bytes(assetId).length > 0, "SecureChain: assetId cannot be empty");
        require(bytes(name).length > 0, "SecureChain: name cannot be empty");
        require(initialOwner != address(0), "SecureChain: owner cannot be zero address");

        uint256 tokenId = _incrementTokenId();

        _safeMint(initialOwner, tokenId);
        _setTokenURI(tokenId, metadataURI);

        Asset memory asset = Asset({
            tokenId: tokenId,
            assetId: assetId,
            name: name,
            description: description,
            category: category,
            metadataURI: metadataURI,
            creator: msg.sender,
            currentOwner: initialOwner,
            createdAt: block.timestamp,
            status: 0,
            mintTxHash: ""
        });

        assets[tokenId] = asset;
        userAssets[initialOwner].push(tokenId);

        _recordAudit("ASSET_MINTED", "ASSET", tokenId.toString(), MINTER_ROLE);

        emit AssetMinted(tokenId, assetId, msg.sender, initialOwner, name, block.timestamp);

        return tokenId;
    }

    function allocateAsset(uint256 tokenId, address to) external onlyManager returns (bool) {
        require(to != address(0), "SecureChain: recipient cannot be zero address");
        require(assets[tokenId].tokenId != 0, "SecureChain: asset does not exist");
        require(assets[tokenId].status == 0, "SecureChain: asset not available for allocation");

        address from = assets[tokenId].currentOwner;
        _safeTransfer(from, to, tokenId, "");

        assets[tokenId].currentOwner = to;
        assets[tokenId].status = 1;

        _removeFromArray(userAssets[from], tokenId);
        userAssets[to].push(tokenId);
        assetTransferHistory[tokenId].push(from);
        assetTransferHistory[tokenId].push(to);

        _recordAudit("ASSET_ALLOCATED", "ASSET", tokenId.toString(), MANAGER_ROLE);

        emit AssetAllocated(tokenId, from, to, block.timestamp);

        return true;
    }

    function transferAsset(uint256 tokenId, address to) external onlyAuthorizedForAsset(tokenId) returns (bool) {
        require(to != address(0), "SecureChain: recipient cannot be zero address");
        require(assets[tokenId].tokenId != 0, "SecureChain: asset does not exist");
        require(assets[tokenId].status != 2, "SecureChain: asset is burned");
        require(assets[tokenId].status != 3, "SecureChain: asset is frozen");

        address from = assets[tokenId].currentOwner;
        require(from != to, "SecureChain: cannot transfer to self");

        _safeTransfer(from, to, tokenId, "");

        assets[tokenId].currentOwner = to;
        assets[tokenId].status = 1;

        _removeFromArray(userAssets[from], tokenId);
        userAssets[to].push(tokenId);
        assetTransferHistory[tokenId].push(from);
        assetTransferHistory[tokenId].push(to);

        _recordAudit("ASSET_TRANSFERRED", "ASSET", tokenId.toString(), 
            hasRole(ADMIN_ROLE, msg.sender) ? ADMIN_ROLE : 
            hasRole(MANAGER_ROLE, msg.sender) ? MANAGER_ROLE : bytes32(0));

        emit AssetTransferred(tokenId, from, to, block.timestamp);

        return true;
    }

    function assignRole(address account, bytes32 role) external onlyAdmin returns (bool) {
        require(account != address(0), "SecureChain: account cannot be zero address");
        require(
            role == MANAGER_ROLE || role == AUDITOR_ROLE || role == MINTER_ROLE || role == IDENTITY_VERIFIER_ROLE,
            "SecureChain: invalid role"
        );
        require(!hasRole(role, account), "SecureChain: account already has role");

        _grantRole(role, account);

        _recordAudit("ROLE_ASSIGNED", "ROLE", _addressToString(account), role);

        emit RoleAssigned(account, role, msg.sender, block.timestamp);

        return true;
    }

    function revokeRoleFromAccount(address account, bytes32 role) external onlyAdmin returns (bool) {
        require(account != address(0), "SecureChain: account cannot be zero address");
        require(hasRole(role, account), "SecureChain: account does not have role");
        require(role != ADMIN_ROLE, "SecureChain: cannot revoke admin role");

        _revokeRole(role, account);

        _recordAudit("ROLE_REVOKED", "ROLE", _addressToString(account), role);

        emit RoleRevokedCustom(account, role, msg.sender, block.timestamp);

        return true;
    }

    function getAsset(uint256 tokenId) external view returns (Asset memory) {
        require(assets[tokenId].tokenId != 0, "SecureChain: asset does not exist");
        return assets[tokenId];
    }

    function getUserAssets(address user) external view returns (uint256[] memory) {
        return userAssets[user];
    }

    function getAssetTransferHistory(uint256 tokenId) external view returns (address[] memory) {
        address[] memory history = assetTransferHistory[tokenId];
        return history;
    }

    function getAuditRecord(uint256 auditId) external view onlyAuditor returns (AuditRecord memory) {
        return auditRecords[auditId];
    }

    function getAuditCount() external view onlyAuditor returns (uint256) {
        return _auditCounter;
    }

    function getAssetsByCategory(string calldata category) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (bytes(assets[i].category).length > 0 && keccak256(bytes(assets[i].category)) == keccak256(bytes(category))) {
                count++;
            }
        }
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (bytes(assets[i].category).length > 0 && keccak256(bytes(assets[i].category)) == keccak256(bytes(category))) {
                result[idx] = i;
                idx++;
            }
        }
        return result;
    }

    function burnAsset(uint256 tokenId) external onlyAuthorizedForAsset(tokenId) returns (bool) {
        require(assets[tokenId].tokenId != 0, "SecureChain: asset does not exist");
        require(assets[tokenId].status != 2, "SecureChain: asset already burned");

        _burn(tokenId);
        assets[tokenId].status = 2;

        _removeFromArray(userAssets[assets[tokenId].currentOwner], tokenId);

        _recordAudit("ASSET_BURNED", "ASSET", tokenId.toString(), 
            hasRole(ADMIN_ROLE, msg.sender) ? ADMIN_ROLE : bytes32(0));

        return true;
    }

    function freezeAsset(uint256 tokenId) external onlyAdmin returns (bool) {
        require(assets[tokenId].tokenId != 0, "SecureChain: asset does not exist");
        require(assets[tokenId].status != 3, "SecureChain: asset already frozen");

        assets[tokenId].status = 3;

        _recordAudit("ASSET_FROZEN", "ASSET", tokenId.toString(), ADMIN_ROLE);

        return true;
    }

    function unfreezeAsset(uint256 tokenId) external onlyAdmin returns (bool) {
        require(assets[tokenId].tokenId != 0, "SecureChain: asset does not exist");
        require(assets[tokenId].status == 3, "SecureChain: asset not frozen");

        assets[tokenId].status = 0;

        _recordAudit("ASSET_UNFROZEN", "ASSET", tokenId.toString(), ADMIN_ROLE);

        return true;
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

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}