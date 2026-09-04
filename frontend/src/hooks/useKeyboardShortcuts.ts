import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useToast } from '../context/ToastContext';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  global?: boolean;
}

interface UseKeyboardShortcutsOptions {
  shortcuts?: Shortcut[];
  enabled?: boolean;
  target?: HTMLElement | Document;
}

export function useKeyboardShortcuts({
  shortcuts = [],
  enabled = true,
  target = document,
}: UseKeyboardShortcutsOptions = {}) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const isInput = event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement ||
      (event.target as HTMLElement)?.isContentEditable;

    for (const shortcut of shortcutsRef.current) {
      if (!shortcut.global && isInput) continue;

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = (shortcut.ctrl ?? false) === (event.ctrlKey || event.metaKey);
      const shiftMatches = (shortcut.shift ?? false) === event.shiftKey;
      const altMatches = (shortcut.alt ?? false) === event.altKey;

      if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [enabled]);

  useEffect(() => {
    target.addEventListener('keydown', handleKeyDown);
    return () => target.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, target]);
}

export function createGlobalShortcuts(actions: {
  onSearch?: () => void;
  onCommandPalette?: () => void;
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  onConnectWallet?: () => void;
  onQuickAction?: (action: string) => void;
  onNavigate?: (path: string) => void;
  onRefresh?: () => void;
  onHelp?: () => void;
}) {
  return [
    { key: 'k', ctrl: true, description: 'Open search', action: actions.onSearch, global: true },
    { key: 'p', ctrl: true, shift: true, description: 'Open command palette', action: actions.onCommandPalette, global: true },
    { key: 'b', ctrl: true, description: 'Toggle sidebar', action: actions.onToggleSidebar, global: true },
    { key: 'd', ctrl: true, description: 'Toggle theme', action: actions.onToggleTheme, global: true },
    { key: 'w', ctrl: true, description: 'Connect wallet', action: actions.onConnectWallet, global: true },
    { key: 'r', ctrl: true, description: 'Refresh data', action: actions.onRefresh, global: true },
    { key: '?', shift: true, description: 'Show help', action: actions.onHelp, global: true },
    { key: '1', ctrl: true, description: 'Go to Dashboard', action: () => actions.onNavigate?.('/dashboard'), global: true },
    { key: '2', ctrl: true, description: 'Go to Identities', action: () => actions.onNavigate?.('/identities'), global: true },
    { key: '3', ctrl: true, description: 'Go to Assets', action: () => actions.onNavigate?.('/assets'), global: true },
    { key: '4', ctrl: true, description: 'Go to Transfers', action: () => actions.onNavigate?.('/transfers'), global: true },
    { key: '5', ctrl: true, description: 'Go to Audit', action: () => actions.onNavigate?.('/audit'), global: true },
    { key: '6', ctrl: true, description: 'Go to Blockchain', action: () => actions.onNavigate?.('/blockchain'), global: true },
  ].filter(s => s.action) as Shortcut[];
}

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, connect } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const { user, hasRole } = useAuth();
  const toast = useToast();

  const isAdmin = hasRole(['ADMIN']);
  const isAuditor = hasRole(['ADMIN', 'AUDITOR']);

  const shortcuts = createGlobalShortcuts({
    onSearch: () => {
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      searchInput?.focus();
    },
    onCommandPalette: () => {
      toast.info('Command palette coming soon (Ctrl+Shift+P)');
    },
    onToggleSidebar: () => {
      window.dispatchEvent(new CustomEvent('toggle-sidebar'));
    },
    onToggleTheme: () => toggleTheme(),
    onConnectWallet: () => {
      if (!isConnected) connect();
    },
    onRefresh: () => {
      window.dispatchEvent(new CustomEvent('refresh-data'));
      toast.success('Refreshing data...');
    },
    onHelp: () => {
      toast.info('Keyboard shortcuts: Ctrl+K (Search), Ctrl+B (Sidebar), Ctrl+D (Theme), Ctrl+1-6 (Navigate), ? (Help)');
    },
    onNavigate: (path) => {
      if (path === '/admin/users' && !isAdmin) {
        toast.error('Admin access required');
        return;
      }
      if (path === '/audit' && !isAuditor) {
        toast.error('Auditor access required');
        return;
      }
      navigate(path);
    },
    onQuickAction: (action) => {
      toast.info(`Quick action: ${action}`);
    },
  });

  useKeyboardShortcuts({ shortcuts, enabled: true });
}

import { useTheme } from '../context/ThemeContext';