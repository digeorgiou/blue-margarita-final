INSERT INTO materials (id, name, current_unit_cost, unit_of_measure, is_active, created_at, uuid) VALUES
-- Precious Metals
(1, 'Χρυσός 14Κ', '45.50', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(2, 'Χρυσός 18Κ', '58.75', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(3, 'Ασήμι 925', '0.85', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(4, 'Λευκόχρυσος 14Κ', '47.20', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(5, 'Ροζ Χρυσός 14Κ', '46.80', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(6, 'Πλατίνα', '32.40', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),

-- Base Metals
(7, 'Ορείχαλκος', '8.50', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(8, 'Χαλκός', '0.12', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(9, 'Inox', '2.20', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(10, 'Αλουμίνιο', '1.85', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),

-- Precious Stones
(11, 'Διαμάντι 0.1ct', '180.00', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(12, 'Διαμάντι 0.25ct', '450.00', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(13, 'Ρουμπίνι', '25.50', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(14, 'Σαπφείρο', '32.80', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(15, 'Σμαράγδι', '68.90', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),

-- Semi-Precious Stones
(16, 'Αμέθυστος', '5.20', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(17, 'Τοπάζι', '8.50', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(18, 'Γρανάτης', '4.30', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(19, 'Περιδότι', '12.80', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(20, 'Τσιτρίν', '6.70', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(21, 'Ιάσπιδα', '3.40', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),

-- Organic Materials
(22, 'Μαργαριτάρι Γλυκού Νερού', '15.60', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(23, 'Μαργαριτάρι Θαλάσσης', '85.40', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(24, 'Κεχριμπάρι', '22.30', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(25, 'Κοράλλι', '18.90', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),

-- Synthetic/Alternative Materials
(26, 'Κυβική Ζιρκονία', '2.80', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(27, 'Swarovski Κρύσταλλος', '4.50', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(28, 'Γυαλί Murano', '8.20', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(29, 'Κεραμικό', '6.40', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),

-- Chains and Findings
(30, 'Αλυσίδα Χρυσή 14Κ', '3.20', 'εκατοστά', 1, CURRENT_TIMESTAMP(), UUID()),
(31, 'Αλυσίδα Ασημένια', '0.45', 'εκατοστά', 1, CURRENT_TIMESTAMP(), UUID()),
(32, 'Κούμπωμα Χρυσό', '12.50', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(33, 'Κούμπωμα Ασημένιο', '2.30', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(34, 'Κρίκοι Χρυσοί', '1.80', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(35, 'Κρίκοι Ασημένιοι', '0.25', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),

-- Tools and Consumables
(36, 'Σύρμα Χρυσό 14Κ', '2.40', 'εκατοστά', 1, CURRENT_TIMESTAMP(), UUID()),
(37, 'Σύρμα Ασημένιο', '0.18', 'εκατοστά', 1, CURRENT_TIMESTAMP(), UUID()),
(38, 'Κόλλα Ασημιού', '45.80', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(39, 'Κόλλα Χρυσού', '78.20', 'γραμμάρια', 1, CURRENT_TIMESTAMP(), UUID()),
(40, 'Γυαλόχαρτο', '2.50', 'φύλλα', 1, CURRENT_TIMESTAMP(), UUID()),

-- Packaging Materials
(41, 'Κουτάκια Δώρου', '0.85', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(42, 'Βελούδινες Θήκες', '3.20', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(43, 'Σακουλάκια Οργάντζας', '0.45', 'τεμάχια', 1, CURRENT_TIMESTAMP(), UUID()),
(44, 'Κορδέλες', '0.15', 'μέτρα', 1, CURRENT_TIMESTAMP(), UUID()),
(45, 'Bubble Wrap', '0.08', 'εκατοστά', 1, CURRENT_TIMESTAMP(), UUID());

ALTER TABLE materials AUTO_INCREMENT = 46;