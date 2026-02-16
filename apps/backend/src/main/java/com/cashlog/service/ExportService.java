package com.cashlog.service;

import com.cashlog.entity.Transaction;
import com.cashlog.repository.TransactionRepository;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExportService {
    
    private final TransactionRepository transactionRepository;
    
    public String exportToCsv(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByTransactionDateBetween(startDate, endDate);
        
        StringWriter writer = new StringWriter();
        try (CSVWriter csvWriter = new CSVWriter(writer)) {
            String[] header = {"Date", "Type", "Amount (KRW)", "Tags", "Memo"};
            csvWriter.writeNext(header);
            
            for (Transaction t : transactions) {
                String[] row = {
                    t.getTransactionDate().toString(),
                    t.getTransactionType().toString(),
                    t.getAmountKrw().toString(),
                    t.getTags().stream().map(tag -> tag.getName()).collect(java.util.stream.Collectors.joining(", ")),
                    t.getMemo() != null ? t.getMemo() : ""
                };
                csvWriter.writeNext(row);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to export CSV", e);
        }
        
        return writer.toString();
    }
    
    public byte[] exportToExcel(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByTransactionDateBetween(startDate, endDate);
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Transactions");
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Date", "Type", "Amount (KRW)", "Tags", "Memo"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
            }
            
            int rowNum = 1;
            for (Transaction t : transactions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(t.getTransactionDate().toString());
                row.createCell(1).setCellValue(t.getTransactionType().toString());
                row.createCell(2).setCellValue(t.getAmountKrw().doubleValue());
                row.createCell(3).setCellValue(t.getTags().stream().map(tag -> tag.getName()).collect(java.util.stream.Collectors.joining(", ")));
                row.createCell(4).setCellValue(t.getMemo() != null ? t.getMemo() : "");
            }
            
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel", e);
        }
    }
}
