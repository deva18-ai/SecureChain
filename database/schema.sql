-- SecureChain Database Schema
-- PostgreSQL schema for SIH26125
-- Run this manually or use Alembic migrations

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'MANAGER', 'AUDITOR', 'USER')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX ix_users_email_active ON users (email, is_active);
CREATE INDEX ix_users_wallet_active ON users (wallet_address, is_active);

-- DIDs (Decentralized Identifiers) table
CREATE TABLE dids (
    id SERIAL PRIMARY KEY,
    did VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL,
    identity_hash VARCHAR(66) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_tx_hash VARCHAR(66),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITHOUT TIME ZONE,
    blockchain_tx_hash VARCHAR(66),
    blockchain_block_number BIGINT
);

CREATE INDEX ix_dids_user_verified ON dids (user_id, verified);
CREATE INDEX ix_dids_wallet ON dids (wallet_address);

-- Assets (NFTs) table
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    token_id BIGINT UNIQUE NOT NULL,
    asset_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    metadata_uri VARCHAR(500) NOT NULL,
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'BURNED', 'FROZEN')),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    blockchain_tx_hash VARCHAR(66),
    blockchain_block_number BIGINT
);

CREATE INDEX ix_assets_owner_status ON assets (owner_id, status);
CREATE INDEX ix_assets_category_status ON assets (category, status);
CREATE INDEX ix_assets_creator ON assets (creator_id);

-- Transfers table (assignment history)
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    initiator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    recipient_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED', 'CANCELLED')),
    blockchain_tx_hash VARCHAR(66),
    blockchain_block_number BIGINT,
    error_message TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX ix_transfers_asset_status ON transfers (asset_id, status);
CREATE INDEX ix_transfers_initiator_status ON transfers (initiator_id, status);
CREATE INDEX ix_transfers_recipient_status ON transfers (recipient_id, status);

-- Audit Logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    actor_address VARCHAR(42),
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'IDENTITY_CREATED', 'IDENTITY_VERIFIED', 'ROLE_ASSIGNED', 'ROLE_REVOKED',
        'ASSET_MINTED', 'ASSET_ALLOCATED', 'ASSET_ASSIGNED', 'ASSET_REVOKED', 'ASSET_TRANSFERRED', 'ASSET_BURNED',
        'ASSET_FROZEN', 'ASSET_UNFROZEN', 'USER_CREATED', 'USER_UPDATED', 'LOGIN', 'LOGOUT'
    )),
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    blockchain_tx_hash VARCHAR(66),
    blockchain_block_number BIGINT,
    blockchain_verified BOOLEAN NOT NULL DEFAULT FALSE,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_audit_logs_actor_created ON audit_logs (actor_id, created_at);
CREATE INDEX ix_audit_logs_action_created ON audit_logs (action, created_at);
CREATE INDEX ix_audit_logs_resource ON audit_logs (resource_type, resource_id);
CREATE INDEX ix_audit_logs_blockchain_verified ON audit_logs (blockchain_verified);

-- Security Events table (for unauthorized attempts, alerts, etc.)
CREATE TABLE security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
        'UNAUTHORIZED_TRANSFER_ATTEMPT',
        'UNAUTHORIZED_APPROVE_ATTEMPT',
        'UNAUTHORIZED_OPERATOR_ATTEMPT',
        'SUSPICIOUS_ACTIVITY',
        'REPEATED_FAILED_AUTH',
        'UNAUTHORIZED_API_ACCESS',
        'ASSET_ASSIGNMENT_CHANGED',
        'ASSET_STATUS_CHANGED',
        'ROLE_ESCALATION_ATTEMPT'
    )),
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    actor_address VARCHAR(42),
    actor_role VARCHAR(20),
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    reason TEXT,
    blockchain_tx_hash VARCHAR(66),
    blockchain_block_number BIGINT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_security_events_actor_created ON security_events (actor_id, created_at);
CREATE INDEX ix_security_events_type_created ON security_events (event_type, created_at);
CREATE INDEX ix_security_events_severity_created ON security_events (severity, created_at);
CREATE INDEX ix_security_events_resolved ON security_events (resolved, created_at);
CREATE INDEX ix_security_events_resource ON security_events (resource_type, resource_id);

-- Blockchain Transactions table
CREATE TABLE blockchain_transactions (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    block_hash VARCHAR(66) NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42),
    value VARCHAR(100) NOT NULL DEFAULT '0',
    gas_used BIGINT,
    gas_price VARCHAR(100),
    status INTEGER NOT NULL CHECK (status IN (0, 1)),
    contract_address VARCHAR(42),
    method_name VARCHAR(100),
    event_data TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_blockchain_txs_from_created ON blockchain_transactions (from_address, created_at);
CREATE INDEX ix_blockchain_txs_contract_created ON blockchain_transactions (contract_address, created_at);

-- Permissions table (for fine-grained access control)
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions mapping table
CREATE TABLE role_permissions (
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'AUDITOR', 'USER')),
    permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role, permission_id)
);

-- Insert default permissions
INSERT INTO permissions (name, description, resource_type, action) VALUES
    ('user.create', 'Create new users', 'USER', 'CREATE'),
    ('user.read', 'Read user information', 'USER', 'READ'),
    ('user.update', 'Update user information', 'USER', 'UPDATE'),
    ('user.delete', 'Delete users', 'USER', 'DELETE'),
    ('user.role.assign', 'Assign roles to users', 'USER', 'ASSIGN_ROLE'),
    ('did.create', 'Create decentralized identifiers', 'DID', 'CREATE'),
    ('did.read', 'Read DID information', 'DID', 'READ'),
    ('did.verify', 'Verify DIDs on blockchain', 'DID', 'VERIFY'),
    ('asset.create', 'Mint new assets (NFTs)', 'ASSET', 'CREATE'),
    ('asset.read', 'Read asset information', 'ASSET', 'READ'),
    ('asset.update', 'Update asset metadata', 'ASSET', 'UPDATE'),
    ('asset.allocate', 'Allocate assets to users', 'ASSET', 'ALLOCATE'),
    ('asset.assign', 'Assign/reassign assets to users', 'ASSET', 'ASSIGN'),
    ('asset.revoke', 'Revoke asset assignments', 'ASSET', 'REVOKE'),
    ('asset.burn', 'Burn assets', 'ASSET', 'BURN'),
    ('asset.freeze', 'Freeze/unfreeze assets', 'ASSET', 'FREEZE'),
    ('transfer.create', 'Initiate transfers', 'TRANSFER', 'CREATE'),
    ('transfer.read', 'Read transfer information', 'TRANSFER', 'READ'),
    ('transfer.approve', 'Approve/reject transfers', 'TRANSFER', 'APPROVE'),
    ('audit.read', 'Read audit logs', 'AUDIT', 'READ'),
    ('audit.verify', 'Verify transactions on blockchain', 'AUDIT', 'VERIFY'),
    ('security.read', 'Read security events', 'SECURITY', 'READ'),
    ('security.manage', 'Manage security events', 'SECURITY', 'MANAGE'),
    ('blockchain.read', 'Read blockchain data', 'BLOCKCHAIN', 'READ'),
    ('system.configure', 'Configure system settings', 'SYSTEM', 'CONFIGURE')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role, permission_id) 
SELECT 'ADMIN', id FROM permissions
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'MANAGER', id FROM permissions WHERE name IN (
    'user.read', 'did.read', 'asset.read', 'asset.allocate', 'asset.assign', 'asset.revoke',
    'transfer.read', 'transfer.approve', 'audit.read', 'blockchain.read', 'security.read'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'AUDITOR', id FROM permissions WHERE name IN (
    'user.read', 'did.read', 'asset.read', 'transfer.read', 'audit.read', 'audit.verify', 'blockchain.read', 'security.read'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'USER', id FROM permissions WHERE name IN (
    'user.read', 'did.read', 'asset.read', 'transfer.read'
)
ON CONFLICT DO NOTHING;

-- Create a default admin user (password: Admin@123 - CHANGE IN PRODUCTION!)
-- This is for development only. In production, create admin through registration
-- and manually update role in database.
-- INSERT INTO users (email, hashed_password, full_name, role, is_active, is_verified)
-- VALUES ('admin@securechain.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S', 'System Admin', 'ADMIN', TRUE, TRUE)
-- ON CONFLICT (email) DO NOTHING;