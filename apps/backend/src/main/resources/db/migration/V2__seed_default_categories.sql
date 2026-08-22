-- V2: Seed the default categories, but only on a database that has none yet.
--
-- Guarding on emptiness keeps this migration harmless for an existing database
-- (for example one restored from a MySQL export, which brings its own
-- categories with explicit ids).

INSERT INTO category (name, color)
SELECT seed.name, seed.color
FROM (
    SELECT * FROM (VALUES
        ('급여', '#10B981'),
        ('금융소득', '#3B82F6'),
        ('이자', '#8B5CF6'),
        ('경조사', '#EC4899'),
        ('카드값', '#EF4444'),
        ('보험료', '#F59E0B'),
        ('통신비', '#06B6D4'),
        ('용돈', '#84CC16'),
        ('현금지출', '#6B7280')
    ) AS v (name, color)
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM category);
