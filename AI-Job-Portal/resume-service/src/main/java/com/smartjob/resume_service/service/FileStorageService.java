package com.smartjob.resume_service.service;

import com.smartjob.resume_service.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDirectory;

    public FileStorageService(
            @Value("${file.upload-dir:uploads/resumes}")
            String uploadDirectory) {

        this.uploadDirectory =
                Paths.get(uploadDirectory)
                        .toAbsolutePath()
                        .normalize();

        try {
            Files.createDirectories(this.uploadDirectory);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create upload directory",
                    e
            );
        }
    }

    public String storeFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.isBlank()) {
            throw new BadRequestException("Invalid file name");
        }

        String extension = "";
        int dotIndex = originalFileName.lastIndexOf(".");

        if (dotIndex > 0) {
            extension = originalFileName.substring(dotIndex).toLowerCase();
        }

        if (!extension.equals(".pdf") && !extension.equals(".docx")) {
            throw new BadRequestException(
                    "Only PDF and DOCX files are supported"
            );
        }

        String storedFileName = UUID.randomUUID() + extension;

        Path target = uploadDirectory.resolve(storedFileName).normalize();

        // Guard against path traversal via a crafted file name.
        if (!target.startsWith(uploadDirectory)) {
            throw new BadRequestException("Invalid file path");
        }

        try {
            Files.copy(
                    file.getInputStream(),
                    target,
                    StandardCopyOption.REPLACE_EXISTING
            );
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }

        return target.toString();
    }
}
