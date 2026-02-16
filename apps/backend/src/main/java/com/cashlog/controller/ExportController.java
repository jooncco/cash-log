package com.cashlog.controller;

import com.cashlog.service.ExportService;
import com.cashlog.service.PdfExportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@Tag(name = "Export", description = "Data export APIs")
public class ExportController {
    
    private final ExportService exportService;
    private final PdfExportService pdfExportService;
    
    @GetMapping("/csv")
    @Operation(summary = "Export transactions to CSV")
    public ResponseEntity<String> exportCsv(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        String csv = exportService.exportToCsv(startDate, endDate);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }
    
    @GetMapping("/excel")
    @Operation(summary = "Export transactions to Excel")
    public ResponseEntity<byte[]> exportExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        byte[] excel = exportService.exportToExcel(startDate, endDate);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }
    
    @GetMapping("/pdf")
    @Operation(summary = "Export transactions to PDF")
    public ResponseEntity<byte[]> exportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        byte[] pdf = pdfExportService.exportToPdf(startDate, endDate);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
