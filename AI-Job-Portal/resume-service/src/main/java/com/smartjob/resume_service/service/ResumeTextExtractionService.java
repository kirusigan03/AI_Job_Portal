package com.smartjob.resume_service.service;

import com.smartjob.resume_service.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Service
public class ResumeTextExtractionService {

    public String extractText(String filePath, String contentType) {

        boolean looksLikePdf = "application/pdf".equalsIgnoreCase(contentType)
                || filePath.toLowerCase().endsWith(".pdf");

        boolean looksLikeDocx = (contentType != null
                && contentType.contains("wordprocessingml.document"))
                || filePath.toLowerCase().endsWith(".docx");

        try {

            if (looksLikePdf) {
                return extractPdf(filePath);
            }

            if (looksLikeDocx) {
                return extractDocx(filePath);
            }

        } catch (IOException e) {
            throw new RuntimeException("Could not extract resume text", e);
        }

        throw new BadRequestException("Unsupported resume file type");
    }

    private String extractPdf(String filePath) throws IOException {

        File file = new File(filePath);

        try (PDDocument document = Loader.loadPDF(file)) {

            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractDocx(String filePath) throws IOException {

        try (FileInputStream inputStream = new FileInputStream(filePath);
             XWPFDocument document = new XWPFDocument(inputStream)) {

            StringBuilder text = new StringBuilder();

            document.getParagraphs()
                    .forEach(paragraph -> text.append(paragraph.getText()).append("\n"));

            document.getTables().forEach(table ->
                    table.getRows().forEach(row ->
                            row.getTableCells().forEach(cell ->
                                    text.append(cell.getText()).append(" "))));

            return text.toString();
        }
    }
}
