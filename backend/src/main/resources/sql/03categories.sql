INSERT INTO categories (id, name, is_active, created_at, uuid) VALUES
(1, 'Σκουλαρίκια', 1, CURRENT_TIMESTAMP(), UUID()),
(2, 'Κολιέ', 1, CURRENT_TIMESTAMP(), UUID()),
(3, 'Δαχτυλίδια', 1, CURRENT_TIMESTAMP(), UUID()),
(4, 'Βραχιόλια', 1, CURRENT_TIMESTAMP(), UUID()),
(5, 'Γούρια', 1, CURRENT_TIMESTAMP(), UUID()),
(6, 'Μενταγιόν', 1, CURRENT_TIMESTAMP(), UUID()),
(7, 'Καρφίτσες', 1, CURRENT_TIMESTAMP(), UUID()),
(8, 'Μανικετόκουμπα', 1, CURRENT_TIMESTAMP(), UUID()),
(9, 'Αλυσίδες', 1, CURRENT_TIMESTAMP(), UUID()),
(10, 'Κρεμαστά', 1, CURRENT_TIMESTAMP(), UUID()),
(11, 'Πιερσινγκ', 1, CURRENT_TIMESTAMP(), UUID()),
(12, 'Σετ Κοσμημάτων', 1, CURRENT_TIMESTAMP(), UUID()),
(13, 'Παιδικά Κοσμήματα', 1, CURRENT_TIMESTAMP(), UUID()),
(14, 'Ρολόγια', 1, CURRENT_TIMESTAMP(), UUID()),
(15, 'Αξεσουάρ', 1, CURRENT_TIMESTAMP(), UUID());
ALTER TABLE categories AUTO_INCREMENT = 16;