package com.smartjob.resume_service.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateResumeRequest {

    @NotBlank
    private String fileName;

    private String fileUrl;

    private String fileType;

    private boolean primaryResume;

    private String extractedText;

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public boolean isPrimaryResume() {
        return primaryResume;
    }

    public void setPrimaryResume(boolean primaryResume) {
        this.primaryResume = primaryResume;
    }

    public String getExtractedText() {
        return extractedText;
    }

    public void setExtractedText(String extractedText) {
        this.extractedText = extractedText;
    }
}