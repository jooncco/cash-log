-- Create category table
CREATE TABLE category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO category (name, color) VALUES
    ('급여', '#10B981'),
    ('금융소득', '#3B82F6'),
    ('이자', '#8B5CF6'),
    ('경조사', '#EC4899'),
    ('카드값', '#EF4444'),
    ('보험료', '#F59E0B'),
    ('통신비', '#06B6D4'),
    ('용돈', '#84CC16'),
    ('현금지출', '#6B7280');

-- Add category_id column to transaction table (nullable first)
ALTER TABLE transaction ADD COLUMN category_id BIGINT;

-- Set default category for existing transactions (use first category)
UPDATE transaction SET category_id = (SELECT MIN(id) FROM category) WHERE category_id IS NULL;

-- Make category_id NOT NULL
ALTER TABLE transaction MODIFY COLUMN category_id BIGINT NOT NULL;

-- Add foreign key constraint
ALTER TABLE transaction ADD CONSTRAINT fk_transaction_category 
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE RESTRICT;

-- Create index on category_id
CREATE INDEX idx_transaction_category_id ON transaction(category_id);
