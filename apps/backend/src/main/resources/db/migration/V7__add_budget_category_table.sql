-- Create budget_category join table
CREATE TABLE budget_category (
    budget_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (budget_id, category_id),
    FOREIGN KEY (budget_id) REFERENCES budget(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_budget_category_budget_id ON budget_category(budget_id);
CREATE INDEX idx_budget_category_category_id ON budget_category(category_id);
