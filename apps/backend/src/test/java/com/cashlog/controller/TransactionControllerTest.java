package com.cashlog.controller;

import com.cashlog.dto.request.CreateTransactionRequest;
import com.cashlog.dto.response.TransactionDTO;
import com.cashlog.entity.TransactionType;
import com.cashlog.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TransactionController.class)
class TransactionControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @MockBean
    private TransactionService transactionService;
    
    @Test
    void createTransaction_Success() throws Exception {
        CreateTransactionRequest request = CreateTransactionRequest.builder()
                .transactionDate(LocalDate.now())
                .transactionType(TransactionType.EXPENSE)
                .originalAmount(new BigDecimal("10000"))
                .originalCurrency("KRW")
                .build();
        
        TransactionDTO response = TransactionDTO.builder()
                .id(1L)
                .transactionDate(request.getTransactionDate())
                .transactionType(request.getTransactionType())
                .amountKrw(request.getOriginalAmount())
                .build();
        
        when(transactionService.createTransaction(any(CreateTransactionRequest.class)))
                .thenReturn(response);
        
        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1));
    }
    
    @Test
    void getAllTransactions_Success() throws Exception {
        when(transactionService.getAllTransactions())
                .thenReturn(Collections.emptyList());
        
        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
