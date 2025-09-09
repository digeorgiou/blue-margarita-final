-- Just update the password if user exists
UPDATE users
SET password = '$2a$11$21EG8KvlkMXoQNmlWW/0l.yREKEePCxXqEN43q3d7lx2cStVNaPl.'
WHERE username = 'admin';

-- Insert only if no admin user exists
INSERT INTO users (id, username, password, role, is_active, uuid, created_at, updated_at)
SELECT 1, 'admin', '$2a$11$21EG8KvlkMXoQNmlWW/0l.yREKEePCxXqEN43q3d7lx2cStVNaPl.', 'ADMIN', true, '550e8400-e29b-41d4-a716-446655440000', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');
