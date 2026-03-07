-- V6: Update tag foreign key to allow cascade delete

ALTER TABLE transaction_tag
DROP FOREIGN KEY transaction_tag_ibfk_2;

ALTER TABLE transaction_tag
ADD CONSTRAINT transaction_tag_ibfk_2
FOREIGN KEY (tag_id) REFERENCES tag(id) ON DELETE CASCADE;
