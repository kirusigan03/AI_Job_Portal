package com.smartjob.resume_service.service;

import com.smartjob.resume_service.dto.ResumeUploadResponse;
import com.smartjob.resume_service.entity.Resume;
import com.smartjob.resume_service.exception.BadRequestException;
import com.smartjob.resume_service.exception.ResourceNotFoundException;
import com.smartjob.resume_service.exception.UnauthorizedException;
import com.smartjob.resume_service.repository.ResumeRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final FileStorageService fileStorageService;
    private final ResumeTextExtractionService textExtractionService;

    public ResumeService(
            ResumeRepository resumeRepository,
            FileStorageService fileStorageService,
            ResumeTextExtractionService textExtractionService
    ) {
        this.resumeRepository = resumeRepository;
        this.fileStorageService = fileStorageService;
        this.textExtractionService = textExtractionService;
    }

    public ResumeUploadResponse uploadResume(
            Long candidateId,
            MultipartFile file,
            boolean primaryResume
    ) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Resume file is required");
        }

        String contentType = file.getContentType();

        boolean isPdf = "application/pdf".equals(contentType);
        boolean isDocx = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                .equals(contentType);

        if (!isPdf && !isDocx) {
            throw new BadRequestException(
                    "Only PDF and DOCX files are supported"
            );
        }

        if (primaryResume) {

            List<Resume> existing = resumeRepository.findByCandidateId(candidateId);
            existing.forEach(resume -> resume.setPrimaryResume(false));
            resumeRepository.saveAll(existing);
        }

        String filePath = fileStorageService.storeFile(file);
        String extractedText = textExtractionService.extractText(filePath, contentType);

        Resume resume = new Resume();
        resume.setCandidateId(candidateId);
        resume.setFileName(file.getOriginalFilename());
        resume.setFileUrl(filePath);
        resume.setFileType(contentType);
        resume.setPrimaryResume(primaryResume);
        resume.setExtractedText(extractedText);

        Resume saved = resumeRepository.save(resume);

        return new ResumeUploadResponse(
                saved.getId(),
                saved.getFileName(),
                saved.getFileType(),
                saved.isPrimaryResume(),
                "Resume uploaded successfully"
        );
    }

    public Resume getResume(Long id) {

        return resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found"));
    }

    /**
     * Enforces that only the resume's owner, or an EMPLOYER/ADMIN
     * (who legitimately need to review a candidate's resume), can view it.
     */
    public Resume getResumeForViewer(Long id, Long viewerId, String viewerRole) {

        Resume resume = getResume(id);

        boolean isOwner = resume.getCandidateId().equals(viewerId);
        boolean isReviewer = "EMPLOYER".equals(viewerRole) || "ADMIN".equals(viewerRole);

        if (!isOwner && !isReviewer) {
            throw new UnauthorizedException("You are not allowed to view this resume");
        }

        return resume;
    }

    public List<Resume> getCandidateResumes(Long candidateId) {

        return resumeRepository.findByCandidateId(candidateId);
    }

    public void deleteResume(Long id, Long candidateId) {

        Resume resume = getResume(id);

        if (!resume.getCandidateId().equals(candidateId)) {
            throw new UnauthorizedException("You cannot delete this resume");
        }

        resumeRepository.delete(resume);
    }
}
