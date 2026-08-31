import json
import os
from typing import Optional, Dict, Any, List
from web3 import Web3
from web3.types import TxReceipt, TxData
from eth_account import Account
from app.config import settings

CONTRACT_ABI = [
    {"inputs": [{"internalType": "string", "name": "did", "type": "string"}, {"internalType": "address", "name": "wallet", "type": "address"}, {"internalType": "bytes32", "name": "identityHash", "type": "bytes32"}], "name": "createIdentity", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "string", "name": "did", "type": "string"}], "name": "verifyIdentity", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "string", "name": "did", "type": "string"}], "name": "getIdentity", "outputs": [{"components": [{"internalType": "string", "name": "did", "type": "string"}, {"internalType": "address", "name": "wallet", "type": "address"}, {"internalType": "bytes32", "name": "identityHash", "type": "bytes32"}, {"internalType": "bool", "name": "verified", "type": "bool"}, {"internalType": "uint256", "name": "createdAt", "type": "uint256"}, {"internalType": "uint256", "name": "verifiedAt", "type": "uint256"}, {"internalType": "string", "name": "verificationTxHash", "type": "string"}], "internalType": "struct SecureChain.Identity", "name": "", "type": "tuple"}], "stateMutability": "view", "type": "function"},
    {"inputs": [{"internalType": "string", "name": "assetId", "type": "string"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "description", "type": "string"}, {"internalType": "string", "name": "category", "type": "string"}, {"internalType": "string", "name": "metadataURI", "type": "string"}, {"internalType": "address", "name": "initialOwner", "type": "address"}], "name": "mintAsset", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "address", "name": "to", "type": "address"}], "name": "allocateAsset", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "address", "name": "to", "type": "address"}], "name": "transferAsset", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "account", "type": "address"}, {"internalType": "bytes32", "name": "role", "type": "bytes32"}], "name": "assignRole", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "address", "name": "account", "type": "address"}, {"internalType": "bytes32", "name": "role", "type": "bytes32"}], "name": "revokeRole", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
    {"inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}], "name": "getAsset", "outputs": [{"components": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"internalType": "string", "name": "assetId", "type": "string"}, {"internalType": "string", "name": "name", "type": "string"}, {"internalType": "string", "name": "description", "type": "string"}, {"internalType": "string", "name": "category", "type": "string"}, {"internalType": "string", "name": "metadataURI", "type": "string"}, {"internalType": "address", "name": "creator", "type": "address"}, {"internalType": "address", "name": "currentOwner", "type": "address"}, {"internalType": "uint256", "name": "createdAt", "type": "uint256"}, {"internalType": "uint8", "name": "status", "type": "uint8"}, {"internalType": "string", "name": "mintTxHash", "type": "string"}], "internalType": "struct SecureChain.Asset", "name": "", "type": "tuple"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
    {"inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
    {"anonymous": False, "inputs": [{"indexed": True, "internalType": "string", "name": "did", "type": "string"}, {"indexed": True, "internalType": "address", "name": "wallet", "type": "address"}, {"indexed": False, "internalType": "bytes32", "name": "identityHash", "type": "bytes32"}, {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"indexed": False, "internalType": "string", "name": "txHash", "type": "string"}], "name": "IdentityCreated", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "internalType": "string", "name": "did", "type": "string"}, {"indexed": True, "internalType": "address", "name": "verifier", "type": "address"}, {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"indexed": False, "internalType": "string", "name": "txHash", "type": "string"}], "name": "IdentityVerified", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"indexed": True, "internalType": "string", "name": "assetId", "type": "string"}, {"indexed": True, "internalType": "address", "name": "creator", "type": "address"}, {"indexed": True, "internalType": "address", "name": "owner", "type": "address"}, {"indexed": False, "internalType": "string", "name": "name", "type": "string"}, {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"indexed": False, "internalType": "string", "name": "txHash", "type": "string"}], "name": "AssetMinted", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"indexed": True, "internalType": "address", "name": "from", "type": "address"}, {"indexed": True, "internalType": "address", "name": "to", "type": "address"}, {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"indexed": False, "internalType": "string", "name": "txHash", "type": "string"}], "name": "AssetAllocated", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "internalType": "uint256", "name": "tokenId", "type": "uint256"}, {"indexed": True, "internalType": "address", "name": "from", "type": "address"}, {"indexed": True, "internalType": "address", "name": "to", "type": "address"}, {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"indexed": False, "internalType": "string", "name": "txHash", "type": "string"}], "name": "AssetTransferred", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "internalType": "address", "name": "account", "type": "address"}, {"indexed": True, "internalType": "bytes32", "name": "role", "type": "bytes32"}, {"indexed": True, "internalType": "address", "name": "assigner", "type": "address"}, {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"indexed": False, "internalType": "string", "name": "txHash", "type": "string"}], "name": "RoleAssigned", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "internalType": "address", "name": "account", "type": "address"}, {"indexed": True, "internalType": "bytes32", "name": "role", "type": "bytes32"}, {"indexed": True, "internalType": "address", "name": "revoker", "type": "address"}, {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}, {"indexed": False, "internalType": "string", "name": "txHash", "type": "string"}], "name": "RoleRevoked", "type": "event"},
    {"anonymous": False, "inputs": [{"indexed": True, "internalType": "uint256", "name": "auditId", "type": "uint256"}, {"indexed": True, "internalType": "address", "name": "actor", "type": "address"}, {"indexed": False, "internalType": "string", "name": "action", "type": "string"}, {"indexed": False, "internalType": "string", "name": "resourceType", "type": "string"}, {"indexed": False, "internalType": "string", "name": "resourceId", "type": "string"}, {"indexed": False, "internalType": "bytes32", "name": "role", "type": "bytes32"}, {"indexed": False, "internalType": "string", "name": "txHash", "type": "string"}, {"indexed": False, "internalType": "uint256", "name": "blockNumber", "type": "uint256"}, {"indexed": False, "internalType": "uint256", "name": "timestamp", "type": "uint256"}], "name": "AuditRecorded", "type": "event"},
]


class BlockchainService:
    def __init__(self):
        self.rpc_url = settings.BLOCKCHAIN_RPC_URL
        self.contract_address = settings.CONTRACT_ADDRESS
        self.private_key = settings.DEPLOYER_PRIVATE_KEY
        self.w3 = None
        self.contract = None
        self.account = None
        self._initialized = False

    def _initialize(self):
        if self._initialized:
            return
        try:
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            if self.contract_address and self.w3.is_connected():
                self.contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.contract_address),
                    abi=CONTRACT_ABI,
                )
            if self.private_key:
                self.account = Account.from_key(self.private_key)
            self._initialized = True
        except Exception as e:
            print(f"Blockchain service initialization failed: {e}")
            self._initialized = True

    def is_connected(self) -> bool:
        self._initialize()
        return self.w3 is not None and self.w3.is_connected()

    async def get_status(self) -> Dict[str, Any]:
        self._initialize()
        if not self.is_connected():
            return {
                "connected": False,
                "network": None,
                "chain_id": None,
                "block_number": None,
                "contract_address": self.contract_address,
                "contract_verified": False,
            }

        try:
            network = self.w3.eth.chain_id
            block_number = self.w3.eth.block_number
            contract_verified = False
            if self.contract:
                try:
                    name = self.contract.functions.name().call()
                    contract_verified = name == "SecureChain Asset"
                except Exception:
                    pass

            return {
                "connected": True,
                "network": "localhost" if network == 31337 else f"chain-{network}",
                "chain_id": network,
                "block_number": block_number,
                "contract_address": self.contract_address,
                "contract_verified": contract_verified,
            }
        except Exception as e:
            return {
                "connected": False,
                "network": None,
                "chain_id": None,
                "block_number": None,
                "contract_address": self.contract_address,
                "contract_verified": False,
            }

    async def create_identity(self, did: str, wallet: str, identity_hash: str) -> Optional[str]:
        self._initialize()
        if not self.contract or not self.account:
            return None

        try:
            tx = self.contract.functions.createIdentity(
                did, Web3.to_checksum_address(wallet), identity_hash
            ).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas": 300000,
                "gasPrice": self.w3.eth.gas_price,
            })
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return tx_hash.hex()
        except Exception as e:
            print(f"Create identity failed: {e}")
            return None

    async def verify_identity(self, did: str) -> Optional[str]:
        self._initialize()
        if not self.contract or not self.account:
            return None

        try:
            tx = self.contract.functions.verifyIdentity(did).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas": 200000,
                "gasPrice": self.w3.eth.gas_price,
            })
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return tx_hash.hex()
        except Exception as e:
            print(f"Verify identity failed: {e}")
            return None

    async def mint_asset(
        self,
        asset_id: str,
        name: str,
        description: str,
        category: str,
        metadata_uri: str,
        initial_owner: str,
    ) -> Optional[int]:
        self._initialize()
        if not self.contract or not self.account:
            return None

        try:
            tx = self.contract.functions.mintAsset(
                asset_id, name, description, category, metadata_uri,
                Web3.to_checksum_address(initial_owner)
            ).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas": 500000,
                "gasPrice": self.w3.eth.gas_price,
            })
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

            logs = self.contract.events.AssetMinted().process_receipt(receipt)
            if logs:
                return logs[0].args.tokenId
            return None
        except Exception as e:
            print(f"Mint asset failed: {e}")
            return None

    async def allocate_asset(self, token_id: int, to_address: str) -> Optional[str]:
        self._initialize()
        if not self.contract or not self.account:
            return None

        try:
            tx = self.contract.functions.allocateAsset(
                token_id, Web3.to_checksum_address(to_address)
            ).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas": 300000,
                "gasPrice": self.w3.eth.gas_price,
            })
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return tx_hash.hex()
        except Exception as e:
            print(f"Allocate asset failed: {e}")
            return None

    async def transfer_asset(
        self, token_id: int, from_address: str, to_address: str
    ) -> Optional[str]:
        self._initialize()
        if not self.contract or not self.account:
            return None

        try:
            tx = self.contract.functions.transferAsset(
                token_id, Web3.to_checksum_address(to_address)
            ).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas": 300000,
                "gasPrice": self.w3.eth.gas_price,
            })
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return tx_hash.hex()
        except Exception as e:
            print(f"Transfer asset failed: {e}")
            return None

    async def assign_role(self, account: str, role: str) -> Optional[str]:
        self._initialize()
        if not self.contract or not self.account:
            return None

        try:
            role_hash = self.w3.keccak(text=role)
            tx = self.contract.functions.assignRole(
                Web3.to_checksum_address(account), role_hash
            ).build_transaction({
                "from": self.account.address,
                "nonce": self.w3.eth.get_transaction_count(self.account.address),
                "gas": 200000,
                "gasPrice": self.w3.eth.gas_price,
            })
            signed_tx = self.account.sign_transaction(tx)
            tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
            return tx_hash.hex()
        except Exception as e:
            print(f"Assign role failed: {e}")
            return None

    async def get_identity(self, did: str) -> Optional[Dict[str, Any]]:
        self._initialize()
        if not self.contract:
            return None

        try:
            identity = self.contract.functions.getIdentity(did).call()
            return {
                "did": identity[0],
                "wallet": identity[1],
                "identityHash": identity[2].hex() if isinstance(identity[2], bytes) else identity[2],
                "verified": identity[3],
                "createdAt": identity[4],
                "verifiedAt": identity[5],
                "verificationTxHash": identity[6],
            }
        except Exception:
            return None

    async def get_asset(self, token_id: int) -> Optional[Dict[str, Any]]:
        self._initialize()
        if not self.contract:
            return None

        try:
            asset = self.contract.functions.getAsset(token_id).call()
            return {
                "tokenId": asset[0],
                "assetId": asset[1],
                "name": asset[2],
                "description": asset[3],
                "category": asset[4],
                "metadataURI": asset[5],
                "creator": asset[6],
                "currentOwner": asset[7],
                "createdAt": asset[8],
                "status": asset[9],
                "mintTxHash": asset[10],
            }
        except Exception:
            return None

    async def get_transaction_receipt(self, tx_hash: str) -> Optional[TxReceipt]:
        self._initialize()
        if not self.w3:
            return None
        try:
            return self.w3.eth.get_transaction_receipt(tx_hash)
        except Exception:
            return None

    async def get_transaction_receipt_by_event(
        self, event_name: str, token_id: int
    ) -> Optional[TxReceipt]:
        self._initialize()
        if not self.contract:
            return None
        try:
            filter = self.contract.events[event_name].create_filter(
                fromBlock=0, argument_filters={"tokenId": token_id}
            )
            logs = filter.get_all_entries()
            if logs:
                return self.w3.eth.get_transaction_receipt(logs[0].transactionHash.hex())
        except Exception:
            pass
        return None

    async def get_transaction(self, tx_hash: str) -> Optional[TxData]:
        self._initialize()
        if not self.w3:
            return None
        try:
            return self.w3.eth.get_transaction(tx_hash)
        except Exception:
            return None

    async def get_transaction_logs(self, tx_hash: str) -> List[Dict[str, Any]]:
        self._initialize()
        if not self.contract:
            return []
        try:
            receipt = await self.get_transaction_receipt(tx_hash)
            if not receipt:
                return []
            logs = []
            for event_name in ["IdentityCreated", "IdentityVerified", "AssetMinted", "AssetAllocated", "AssetTransferred", "RoleAssigned", "RoleRevoked", "AuditRecorded"]:
                try:
                    event = getattr(self.contract.events, event_name)
                    processed = event().process_receipt(receipt)
                    for log in processed:
                        logs.append({
                            "event": event_name,
                            "args": dict(log.args),
                        })
                except Exception:
                    pass
            return logs
        except Exception:
            return []