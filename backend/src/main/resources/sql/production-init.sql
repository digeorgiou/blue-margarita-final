INSERT INTO users (id, username, password, role, is_active, created_at, updated_at)
VALUES (1, 'admin', '$2a$10$EixXVJA6v8a4m.rjSI0xBuNqK7C1kKmKqvfpPaUAOgNqJcJvOcT7u', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;