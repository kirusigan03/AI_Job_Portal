package com.smartjob.resume_service.service;

import com.smartjob.resume_service.exception.BadRequestException;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FileStorageServiceTest {

    private final FileStorageService fileStorageService =
            new FileStorageService(tempUploadDir());

    @Test
    void rejectsUnsupportedFileExtension() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.txt",
                "text/plain",
                "not a resume".getBytes()
        );

        assertThrows(BadRequestException.class, () -> fileStorageService.storeFile(file));
    }

    @Test
    void rejectsEmptyFile() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.pdf",
                "application/pdf",
                new byte[0]
        );

        assertThrows(BadRequestException.class, () -> fileStorageService.storeFile(file));
    }

    @Test
    void storesPdfWithGeneratedName() {

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "resume.pdf",
                "application/pdf",
                "%PDF-1.4 minimal content".getBytes()
        );

        String storedPath = fileStorageService.storeFile(file);

        assertTrue(storedPath.endsWith(".pdf"));
    }

    private String tempUploadDir() {
        return Path.of(System.getProperty("java.io.tmpdir"), "resume-service-test-uploads")
                .toString();
    }
}
