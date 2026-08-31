import { useState } from 'react';
import { Loader2, AlertCircle, Activity, Shield, Box, GitBranch, User, Key, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import { useAuditLogs } from '../hooks/useApi';
import { formatDate, formatRelativeTime, getStatusColor } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const AUDIT_ACTION_COLORS: Record<string, string> = {
  IDENTITY_CREATED: 'primary',
  IDENTITY_VERIFIED: 'success',
  ROLE_ASSIGNED: 'primary',
  ROLE_REVOKED: 'warning',
  ASSET_MINTED: 'primary',
  ASSET_ALLOCATED: 'success',
  ASSET_TRANSFERRED: 'primary',
  ASSET_BURNED: 'danger',
  ASSET_FROZEN: 'warning',
  ASSET_UNFROZEN: 'success',
  USER_CREATED: 'primary',
  USER_UPDATED: 'primary',
  LOGIN: 'default',
  LOGOUT: 'default',
};

const ACTION_ICONS: Record<string, any> = {
  IDENTITY_CREATED: Key,
  IDENTITY_VERIFIED: Shield,
  ROLE_ASSIGNED: User,
  ROLE_REVOKED: User,
  ASSET_MINTED: Box,
  ASSET_ALLOCATED: GitBranch,
  ASSET_TRANSFERRED: GitBranch,
  ASSET_BURNED: Box,
  ASSET_FROZEN: Box,
  ASSET_UNFROZEN: Box,
  USER_CREATED: User,
  USER_UPDATED: User,
  LOGIN: Activity,
  LOGOUT: Activity,
};

export default function MyActivityPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);

  const { data: logsData, isLoading, error, refetch } = useAuditLogs({
    page,
    page_size: 50,
    actor_id: user?.id,
    action: actionFilter,
  });

  const actions = [
    'IDENTITY_CREATED', 'IDENTITY_VERIFIED', 'ROLE_ASSIGNED', 'ROLE_REVOKED',
    'ASSET_MINTED', 'ASSET_ALLOCATED', 'ASSET_TRANSFERRED', 'ASSET_BURNED',
    'ASSET_FROZEN', 'ASSET_UNFROZEN', 'USER_CREATED', 'USER_UPDATED', 'LOGIN', 'LOGOUT'
  ];

  if (isLoading && !logsData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Activity</h1>
          <p className="text-dark-600 dark:text-dark-400">View your personal activity history</p>
        </div>
        <Card className="p-6 animate-pulse">
          <div className="h-4 w-48 bg-dark-200 dark:bg-dark-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-dark-100 dark:bg-dark-800 rounded" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const logs = logsData?.items || [];
  const total = logsData?.total || 0;
  const totalPages = logsData?.total_pages || 1;

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-white">My Activity</h1>
          <p className="text-dark-600 dark:text-dark-400">View your personal activity and audit history</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} size="sm">
          <Loader2 className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-dark-600 dark:text-dark-400">Filter by Action:</label>
            <select
              value={actionFilter || 'all'}
              onChange={(e) => { const val = e.target.value; setActionFilter(val === 'all' ? undefined : val); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-dark-900 dark:text-white text-sm"
            >
              <option value="all">All Actions</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Blockchain</th>
                <th>Verified</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-dark-500 dark:text-dark-400">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No activity found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const Icon = ACTION_ICONS[log.action] || Activity;
                  return (
                    <tr key={log.id}>
                      <td className="text-sm text-dark-600 dark:text-dark-400 whitespace-nowrap">
                        {formatRelativeTime(log.created_at)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          <Badge variant={AUDIT_ACTION_COLORS[log.action] || 'default'}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm font-medium text-dark-900 dark:text-white">{log.resource_type}</p>
                        <p className="text-xs text-dark-500 dark:text-dark-400 font-mono">{log.resource_id}</p>
                      </td>
                      <td>
                        {log.blockchain_tx_hash ? (
                          <span className="font-mono text-xs text-green-600 dark:text-green-400">
                            {log.blockchain_tx_hash.substring(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-xs text-dark-500 dark:text-dark-400">No tx hash</span>
                        )}
                      </td>
                      <td>
                        <Badge variant={log.blockchain_verified ? 'success' : 'warning'}>
                          {log.blockchain_verified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-dark-200 dark:border-dark-700 flex items-center justify-between">
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total} activities
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Activity className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Total Activities</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">{total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Blockchain Verified</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">
                {logs.filter(l => l.blockchain_verified).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Box className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Asset Actions</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">
                {logs.filter(l => l.action.startsWith('ASSET_')).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Key className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-dark-500 dark:text-dark-400">Identity Actions</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-white">
                {logs.filter(l => l.action.startsWith('IDENTITY_')).length}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}