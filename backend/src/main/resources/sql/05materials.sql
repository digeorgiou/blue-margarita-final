INSERT INTO materials (id, name, current_unit_cost, unit_of_measure, is_active, created_by_id, last_updated_by, created_at, updated_at, uuid) VALUES
-- Precious Metals (reduced by ~90%)
(1, 'Χρυσός 18Κ', '5.25', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(2, 'Χρυσός 14Κ', '3.90', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(3, 'Χρυσός 9Κ', '2.25', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(4, 'Ασήμι 925', '0.85', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(5, 'Ασήμι 999', '0.95', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(6, 'Λευκόχρυσος', '4.80', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(7, 'Ροζ Χρυσός', '5.10', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Gemstones (reduced by ~95%)
(8, 'Διαμάντι 0.25ct', '22.50', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(9, 'Διαμάντι 0.50ct', '45.00', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(10, 'Διαμάντι 1.00ct', '85.00', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(11, 'Σμαράγδι', '18.00', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(12, 'Ρουμπίνι', '22.00', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(13, 'Ζαφείρι', '19.50', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(14, 'Τοπάζι', '4.60', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(15, 'Αμέθυστος', '2.85', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(16, 'Κιτρίνι', '3.60', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(17, 'Οπάλι', '6.50', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(18, 'Γρανάδα', '4.20', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Pearls (reduced by ~90%)
(19, 'Μαργαριτάρι Φυσικό', '8.50', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(20, 'Μαργαριτάρι Καλλιέργειας', '2.55', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(21, 'Μαργαριτάρι Μαύρο', '9.50', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Semi-precious stones (reduced by ~85%)
(22, 'Τιγερίτι', '1.90', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(23, 'Λάπις Λάζουλι', '2.30', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(24, 'Μαλαχίτης', '2.85', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(25, 'Καρνεόλη', '1.45', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Hardware and Findings (reduced by ~85%)
(26, 'Αλυσίδα Χρυσή', '0.50', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(27, 'Αλυσίδα Ασημένια', '0.07', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(28, 'Κούμπωμα Χρυσό', '1.90', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(29, 'Κούμπωμα Ασημένιο', '0.35', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(30, 'Κρίκοι Χρυσοί', '0.27', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(31, 'Κρίκοι Ασημένιοι', '0.04', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Tools and Consumables (reduced by ~85%)
(32, 'Σύρμα Χρυσό 14Κ', '0.36', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(33, 'Σύρμα Ασημένιο', '0.03', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(34, 'Κόλλα Ασημιού', '6.90', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(35, 'Κόλλα Χρυσού', '11.75', 'γραμμάρια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(36, 'Γυαλόχαρτο', '0.38', 'φύλλα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),

-- Packaging Materials (slightly reduced by ~50%)
(37, 'Κουτάκια Δώρου', '0.42', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(38, 'Βελούδινες Θήκες', '1.60', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(39, 'Σακουλάκια Οργάντζας', '0.23', 'τεμάχια', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(40, 'Κορδέλες', '0.08', 'μέτρα', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID()),
(41, 'Bubble Wrap', '0.04', 'εκατοστά', 1, 1, 1, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), UUID());

ALTER TABLE materials AUTO_INCREMENT = 42;
