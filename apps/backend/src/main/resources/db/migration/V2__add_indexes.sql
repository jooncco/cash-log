-- V2: Add indexes for performance optimization

CREATE INDEX idx_transaction_created_at ON transaction(created_at);
CREATE INDEX idx_transaction_amount_krw ON transaction(amount_krw);
CREATE INDEX idx_budget_year_month ON budget(year, month);
