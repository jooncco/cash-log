-- V3: Add constraints and validation

ALTER TABLE transaction ADD CONSTRAINT chk_amount_positive CHECK (original_amount > 0);
ALTER TABLE transaction ADD CONSTRAINT chk_amount_krw_positive CHECK (amount_krw > 0);
ALTER TABLE transaction ADD CONSTRAINT chk_conversion_rate_range CHECK (conversion_rate IS NULL OR (conversion_rate >= 0.01 AND conversion_rate <= 10000));
ALTER TABLE budget ADD CONSTRAINT chk_target_amount_positive CHECK (target_amount > 0);
ALTER TABLE budget ADD CONSTRAINT chk_month_range CHECK (month BETWEEN 1 AND 12);
