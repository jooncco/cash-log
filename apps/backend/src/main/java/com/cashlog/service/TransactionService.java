package com.cashlog.service;

import com.cashlog.dto.request.CreateTransactionRequest;
import com.cashlog.dto.response.TransactionDTO;
import com.cashlog.entity.Category;
import com.cashlog.entity.Tag;
import com.cashlog.entity.Transaction;
import com.cashlog.entity.TransactionType;
import com.cashlog.exception.ResourceNotFoundException;
import com.cashlog.mapper.TransactionMapper;
import com.cashlog.repository.CategoryRepository;
import com.cashlog.repository.TagRepository;
import com.cashlog.repository.TransactionRepository;
import com.cashlog.specification.TransactionSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionService {
    
    private final TransactionRepository transactionRepository;
    private final TagRepository tagRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionMapper transactionMapper;
    
    @Transactional
    public TransactionDTO createTransaction(CreateTransactionRequest request) {
        BigDecimal amountKrw = calculateAmountKrw(request.getOriginalAmount(), 
                request.getOriginalCurrency(), request.getConversionRate());
        
        Set<Tag> tags = resolveTags(request.getTagNames());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

        Transaction transaction = Transaction.builder()
                .transactionDate(request.getTransactionDate())
                .transactionType(request.getTransactionType())
                .originalAmount(request.getOriginalAmount())
                .originalCurrency(request.getOriginalCurrency())
                .conversionRate(request.getConversionRate())
                .amountKrw(amountKrw)
                .category(category)
                .memo(request.getMemo())
                .fixedCost(resolveFixedCost(request))
                .tags(tags)
                .build();
        
        Transaction saved = transactionRepository.save(transaction);
        return transactionMapper.toDTO(saved);
    }
    
    public TransactionDTO getTransaction(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        return transactionMapper.toDTO(transaction);
    }
    
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAllByOrderByTransactionDateDesc().stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<TransactionDTO> getTransactionsByDateRange(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByTransactionDateBetweenOrderByTransactionDateDesc(startDate, endDate).stream()
                .map(transactionMapper::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * DB-level filtered + paginated lookup, replacing the old approach of pulling
     * a (possibly date-ranged) list into memory and filtering it with streams.
     */
    public Page<TransactionDTO> getTransactions(
            LocalDate startDate,
            LocalDate endDate,
            TransactionType type,
            List<Long> categoryIds,
            List<Long> tagIds,
            Pageable pageable) {
        Specification<Transaction> spec = TransactionSpecifications.withFilters(startDate, endDate, type, categoryIds, tagIds);
        return transactionRepository.findAll(spec, pageable).map(transactionMapper::toDTO);
    }
    
    @Transactional
    public TransactionDTO updateTransaction(Long id, CreateTransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + id));
        
        BigDecimal amountKrw = calculateAmountKrw(request.getOriginalAmount(), 
                request.getOriginalCurrency(), request.getConversionRate());
        
        Set<Tag> tags = resolveTags(request.getTagNames());

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + request.getCategoryId()));

        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setTransactionType(request.getTransactionType());
        transaction.setOriginalAmount(request.getOriginalAmount());
        transaction.setOriginalCurrency(request.getOriginalCurrency());
        transaction.setConversionRate(request.getConversionRate());
        transaction.setAmountKrw(amountKrw);
        transaction.setCategory(category);
        transaction.setMemo(request.getMemo());
        transaction.setFixedCost(resolveFixedCost(request));
        transaction.setTags(tags);
        
        Transaction updated = transactionRepository.save(transaction);
        return transactionMapper.toDTO(updated);
    }

    @Transactional
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transaction not found: " + id);
        }
        transactionRepository.deleteById(id);
    }
    
    /**
     * "고정비" only makes sense for money going out, so the flag is forced back
     * to false on income. That keeps the dashboard's fixed-cost total a pure
     * expense figure no matter what the client sends.
     */
    private boolean resolveFixedCost(CreateTransactionRequest request) {
        return request.getTransactionType() == TransactionType.EXPENSE
                && Boolean.TRUE.equals(request.getFixedCost());
    }

    private BigDecimal calculateAmountKrw(BigDecimal originalAmount, String currency, BigDecimal conversionRate) {
        if ("KRW".equals(currency)) {
            return originalAmount;
        }
        if (conversionRate == null) {
            throw new IllegalArgumentException("Conversion rate required for non-KRW currency");
        }
        return originalAmount.multiply(conversionRate);
    }

    /**
     * Resolves (or creates) tags for the given raw tag names, normalizing each
     * name by trimming whitespace and looking it up case-insensitively so that
     * "식비", "식비 " and "식비" (mixed case for latin tags) all resolve to the
     * same tag instead of creating duplicates.
     */
    private Set<Tag> resolveTags(Set<String> tagNames) {
        if (tagNames == null || tagNames.isEmpty()) {
            return new HashSet<>();
        }
        return tagNames.stream()
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .distinct()
                .map(name -> tagRepository.findByNameIgnoreCase(name)
                        .orElseGet(() -> tagRepository.save(Tag.builder()
                                .name(name)
                                .color(generateColorForName(name))
                                .build())))
                .collect(Collectors.toSet());
    }

    /**
     * Deterministically maps a tag name to a color in the palette so the same
     * tag name always gets the same color, instead of a random one on every
     * (re)creation.
     */
    private String generateColorForName(String name) {
        String[] colors = {
            "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899",
            "#14B8A6", "#F97316", "#06B6D4", "#84CC16", "#F43F5E", "#A855F7",
            "#22D3EE", "#FCD34D", "#FB923C", "#4ADE80", "#818CF8", "#F472B6",
            "#2DD4BF", "#FDE047", "#FB7185", "#C084FC", "#38BDF8", "#BEF264"
        };
        int index = Math.floorMod(name.toLowerCase().hashCode(), colors.length);
        return colors[index];
    }
}
