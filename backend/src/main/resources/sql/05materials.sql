INSERT INTO materials (id, name, current_unit_cost, unit_of_measure, is_active, created_by_id, last_updated_by, created_at, updated_at, uuid) VALUES
-- Precious Metals
(1, 'Χρυσός 18Κ', '52.75', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(2, 'Χρυσός 14Κ', '38.90', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(3, 'Χρυσός 9Κ', '22.45', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(4, 'Ασήμι 925', '0.85', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(5, 'Ασήμι 999', '0.95', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(6, 'Λευκόχρυσος', '48.20', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(7, 'Ροζ Χρυσός', '51.30', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Gemstones
(8, 'Διαμάντι 0.25ct', '450.00', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(9, 'Διαμάντι 0.50ct', '1200.00', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(10, 'Διαμάντι 1.00ct', '3500.00', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(11, 'Σμαράγδι', '180.25', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(12, 'Ρουμπίνι', '220.80', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(13, 'Ζαφείρι', '195.60', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(14, 'Τοπάζι', '45.75', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(15, 'Αμέθυστος', '28.50', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(16, 'Κιτρίνι', '35.90', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(17, 'Οπάλι', '65.40', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(18, 'Γρανάδα', '42.15', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Pearls
(19, 'Μαργαριτάρι Φυσικό', '85.75', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(20, 'Μαργαριτάρι Καλλιέργειας', '25.50', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(21, 'Μαργαριτάρι Μαύρο', '95.20', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Semi-precious stones
(22, 'Τιγερίτι', '12.80', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(23, 'Λάπις Λάζουλι', '15.45', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(24, 'Μαλαχίτης', '18.90', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(25, 'Καρνεόλη', '9.65', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Hardware and Findings
(26, 'Αλυσίδα Χρυσή', '3.25', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(27, 'Αλυσίδα Ασημένια', '0.45', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(28, 'Κούμπωμα Χρυσό', '12.50', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(29, 'Κούμπωμα Ασημένιο', '2.30', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(30, 'Κρίκοι Χρυσοί', '1.80', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(31, 'Κρίκοι Ασημένιοι', '0.25', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Tools and Consumables
(32, 'Σύρμα Χρυσό 14Κ', '2.40', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(33, 'Σύρμα Ασημένιο', '0.18', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(34, 'Κόλλα Ασημιού', '45.80', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(35, 'Κόλλα Χρυσού', '78.20', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(36, 'Γυαλόχαρτο', '2.50', 'φύλλα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Packaging Materials
(37, 'Κουτάκια Δώρου', '0.85', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(38, 'Βελούδινες Θήκες', '3.20', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(39, 'Σακουλάκια Οργάντζας', '0.45', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(40, 'Κορδέλες', '0.15', 'μέτρα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(41, 'Bubble Wrap', '0.08', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID());

ALTER TABLE materials AUTO_INCREMENT = 42;
