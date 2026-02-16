package com.cashlog.service;

import com.cashlog.entity.Transaction;
import com.cashlog.repository.TransactionRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PdfExportService {
    
    private final TransactionRepository transactionRepository;
    
    public byte[] exportToPdf(LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository.findByTransactionDateBetween(startDate, endDate);
        
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            document.add(new Paragraph("Transaction Report")
                    .setFontSize(20)
                    .setBold());
            document.add(new Paragraph("Period: " + startDate + " to " + endDate)
                    .setFontSize(12));
            document.add(new Paragraph("\n"));
            
            float[] columnWidths = {2, 2, 2, 2, 3};
            Table table = new Table(columnWidths);
            table.addHeaderCell("Date");
            table.addHeaderCell("Type");
            table.addHeaderCell("Amount (KRW)");
            table.addHeaderCell("Tags");
            table.addHeaderCell("Memo");
            
            for (Transaction t : transactions) {
                table.addCell(t.getTransactionDate().toString());
                table.addCell(t.getTransactionType().toString());
                table.addCell(t.getAmountKrw().toString());
                table.addCell(t.getTags().stream().map(tag -> tag.getName()).collect(java.util.stream.Collectors.joining(", ")));
                table.addCell(t.getMemo() != null ? t.getMemo() : "");
            }
            
            document.add(table);
            document.close();
            
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export PDF", e);
        }
    }
}
