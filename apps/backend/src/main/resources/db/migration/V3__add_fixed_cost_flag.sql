-- V3: 고정비(fixed cost) flag on transaction.
--
-- Marks the outgoings that recur every month regardless of what the user does,
-- so the dashboard can chart and list them apart from discretionary spending.

ALTER TABLE transaction ADD COLUMN fixed_cost BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_transaction_fixed_cost ON transaction (fixed_cost);

-- Back-fill the recorded history. 보험료 / 상환 / 통신비 are fixed by nature;
-- 이자 is the exception because the same category also records interest
-- received, so only its expense side counts.
UPDATE transaction SET fixed_cost = TRUE
WHERE category_id IN (SELECT id FROM category WHERE name IN ('보험료', '상환', '통신비'))
   OR (transaction_type = 'EXPENSE'
       AND category_id IN (SELECT id FROM category WHERE name = '이자'));
