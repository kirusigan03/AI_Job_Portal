package com.smartjob.resume_service.dto;

public class ResumeUploadResponse {

    private Long id;
    private String fileName;
    private String fileType;
    private boolean primaryResume;
    private String message;

    public ResumeUploadResponse(
            Long id,
            String fileName,
            String fileType,
            boolean primaryResume,
            String message) {

        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.primaryResume = primaryResume;
        this.message = message;
    }

    public Long getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public boolean isPrimaryResume() {
        return primaryResume;
    }

    public String getMessage() {
        return message;
    }
}
