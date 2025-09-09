-- Delete existing admin user if exists
DELETE FROM users WHERE username = 'admin';

-- Insert admin user with correct BCrypt hash
INSERT INTO users (id, username, password, role, is_active, uuid, created_at, updated_at)
VALUES (1, 'admin', '$2a$11$21EG8KvlkMXoQNmlWW/0l.yREKEePCxXqEN43q3d7lx2cStVNaPl.', 'ADMIN', true, '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
