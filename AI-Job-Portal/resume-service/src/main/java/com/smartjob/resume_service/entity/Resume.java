package com.smartjob.resume_service.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "resumes")
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long candidateId;

    @Column(nullable = false)
    private String fileName;

    private String fileUrl;

    private String fileType;

    private boolean primaryResume;

    // A resume's extracted text can comfortably exceed a fixed
    // varchar length, so it's stored as a large object instead.
    @Lob
    private String extractedText;

    private LocalDateTime uploadedAt;

    public Resume() {
    }

    @PrePersist
    public void onCreate() {

        uploadedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

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

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}