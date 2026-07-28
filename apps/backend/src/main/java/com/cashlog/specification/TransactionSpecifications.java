package com.cashlog.specification;

import com.cashlog.entity.Tag;
import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;

/**
 * Builds {@link Specification} instances for {@link Transaction} so that
 * date range / type / category / tag filters are applied as a single
 * DB-level query instead of being pulled into memory and filtered in Java.
 */
public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    public static Specification<Transaction> hasDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> cb.between(root.get("transactionDate"), startDate, endDate);
    }

    public static Specification<Transaction> hasType(TransactionType type) {
        return (root, query, cb) -> cb.equal(root.get("transactionType"), type);
    }

    public static Specification<Transaction> hasCategoryIn(List<Long> categoryIds) {
        return (root, query, cb) -> root.get("category").get("id").in(categoryIds);
    }

    public static Specification<Transaction> hasTagIn(List<Long> tagIds) {
        return (root, query, cb) -> {
            query.distinct(true);
            Join<Transaction, Tag> tagJoin = root.join("tags", JoinType.INNER);
            return tagJoin.get("id").in(tagIds);
        };
    }

    /**
     * Composes only the filters that are actually present. Null entries are
     * safely ignored by {@link Specification#allOf}, so callers can pass a
     * null filter for anything that wasn't requested.
     */
    public static Specification<Transaction> withFilters(
            LocalDate startDate,
            LocalDate endDate,
            TransactionType type,
            List<Long> categoryIds,
            List<Long> tagIds) {
        return Specification.allOf(
                (startDate != null && endDate != null) ? hasDateBetween(startDate, endDate) : null,
                type != null ? hasType(type) : null,
                (categoryIds != null && !categoryIds.isEmpty()) ? hasCategoryIn(categoryIds) : null,
                (tagIds != null && !tagIds.isEmpty()) ? hasTagIn(tagIds) : null
        );
    }
}
