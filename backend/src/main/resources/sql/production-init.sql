INSERT INTO users (id, username, password, role, is_active, created_at, updated_at, created_by_id, last_updated_by, uuid) VALUES
(1, 'admin', '$2a$11$fP8pczMMVsi/zGbJ2ZKDB.4hMaBl9pYSHdFFuTjQfLxE8/pcNfKa2', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL, gen_random_uuid());

ALTER SEQUENCE users_id_seq RESTART WITH 2;