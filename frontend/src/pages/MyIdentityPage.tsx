import { useState } from 'react';
import { Shield, Loader2, AlertCircle, CheckCircle, Key, Copy, Wallet, Hash, Calendar, Globe } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useMyDid } from '../hooks/useApi';
import { useCreateDID, useVerifyDID } from '../hooks/useApi';
import { formatAddress, formatDate, formatTxHash } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function MyIdentityPage() {
  const { user } = useAuth();
  const { data: myDid, isLoading, error, refetch } = useMyDid();
  const createDIDMutation = useCreateDID();
  const verifyDIDMutation = useVerifyDID();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleCreateDID = async () => {
    try {
      await createDIDMutation.mutateAsync();
      toast.success('DID created successfully');
      setShowCreateModal(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to create DID');
    }
  };

  const handleVerifyDID = async () => {
    if (!myDid) return;
    setVerifying(true);
    try {
      await verifyDIDMutation.mutateAsync(myDid.id);
      toast.success('DID verified on blockchain');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to verify DID');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (isLoading && !myDid) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Identity</h1>
          <p className="text-dark-600 dark:text-dark-400">Manage your decentralized identifier</p>
        </div>
        <Card className="p-8 animate-pulse">
          <div className="h-4 w-48 bg-dark-200 dark:bg-dark-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-100 dark:bg-dark-800 rounded" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Identity</h1>
        <p className="text-dark-600 dark:text-dark-400">Manage your decentralized identifier (DID)</p>
      </div>

      {!myDid ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">No DID Found</h3>
          <p className="text-dark-600 dark:text-dark-400 mb-6 max-w-md mx-auto">
            You don't have a decentralized identifier yet. Create one to establish your
            cryptographic identity on the blockchain.
          </p>
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Key className="h-4 w-4" />
            Create My DID
          </Button>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-dark-900 dark:text-white">Decentralized Identifier</h3>
                  <p className="text-dark-600 dark:text-dark-400">Your unique identity on SecureChain</p>
                </div>
              </div>
              <Badge variant={myDid.verified ? 'success' : 'warning'} className="text-lg px-4 py-2">
                {myDid.verified ? <CheckCircle className="h-4 w-4 mr-2" /> : ''}
                {myDid.verified ? 'Verified' : 'Pending Verification'}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">DID</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-dark-100 dark:bg-dark-800 px-3 py-2 rounded break-all">{myDid.did}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(myDid.did, 'DID')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Wallet Address</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-dark-100 dark:bg-dark-800 px-3 py-2 rounded">{formatAddress(myDid.wallet_address)}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(myDid.wallet_address, 'Wallet')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Identity Hash</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-xs bg-dark-100 dark:bg-dark-800 px-3 py-2 rounded break-all">{myDid.identity_hash}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(myDid.identity_hash, 'Identity Hash')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Created</p>
                <p className="font-medium text-dark-900 dark:text-white">{formatDate(myDid.created_at)}</p>
              </div>
            </div>

            {myDid.verified && myDid.verified_at && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Verified At</p>
                  <p className="font-medium text-dark-900 dark:text-white">{formatDate(myDid.verified_at)}</p>
                </div>
                {myDid.verification_tx_hash && (
                  <div>
                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-1">Verification Transaction</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 font-mono text-sm bg-dark-100 dark:bg-dark-800 px-3 py-2 rounded break-all text-green-600 dark:text-green-400">
                        {myDid.verification_tx_hash}
                      </code>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(myDid.verification_tx_hash, 'Tx Hash')}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {myDid.blockchain_tx_hash && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6">
                <p className="text-sm text-green-700 dark:text-green-400 mb-1">On-Chain Registration</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="flex-1 font-mono text-sm break-all">{myDid.blockchain_tx_hash}</code>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(myDid.blockchain_tx_hash!, 'Tx Hash')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  {myDid.blockchain_block_number && (
                    <span className="text-sm text-green-700 dark:text-green-400 font-mono">
                      Block #{myDid.blockchain_block_number.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            )}

            {!myDid.verified && (
              <Button onClick={handleVerifyDID} loading={verifying} className="w-full sm:w-auto">
                <CheckCircle className="h-4 w-4" />
                Verify on Blockchain
              </Button>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">About DIDs</h3>
            <div className="space-y-3 text-sm text-dark-600 dark:text-dark-400">
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <p>Your DID follows the <code className="font-mono">did:securechain:</code> method, a custom DID method for this platform.</p>
              </div>
              <div className="flex items-start gap-3">
                <Hash className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <p>The identity hash is a cryptographic proof linking your wallet address to this DID.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <p>Verification creates an immutable record on the blockchain proving your identity exists.</p>
              </div>
              <div className="flex items-start gap-3">
                <Wallet className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <p>Your wallet address is used for signing transactions and proving ownership of assets.</p>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <p>DIDs are globally unique and resolvable. They enable self-sovereign identity.</p>
              </div>
            </div>
          </Card>
        </>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New DID">
        <div className="space-y-4">
          <p className="text-dark-600 dark:text-dark-400">
            This will create a new decentralized identifier (DID) for your account.
            The DID will be registered on-chain using your wallet address.
          </p>
          {!user?.wallet_address && (
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400">
              No wallet address configured. The DID will use a placeholder address until you add a wallet in settings.
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDID} loading={createDIDMutation.isPending}>
              <Key className="h-4 w-4" />
              Create DID
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}