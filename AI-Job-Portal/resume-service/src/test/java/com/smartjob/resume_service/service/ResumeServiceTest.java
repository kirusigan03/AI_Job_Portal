package com.smartjob.resume_service.service;

import com.smartjob.resume_service.entity.Resume;
import com.smartjob.resume_service.exception.BadRequestException;
import com.smartjob.resume_service.exception.ResourceNotFoundException;
import com.smartjob.resume_service.exception.UnauthorizedException;
import com.smartjob.resume_service.repository.ResumeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResumeServiceTest {

    private ResumeRepository resumeRepository;
    private FileStorageService fileStorageService;
    private ResumeTextExtractionService textExtractionService;
    private ResumeService service;

    @BeforeEach
    void setUp() {
        resumeRepository = mock(ResumeRepository.class);
        fileStorageService = mock(FileStorageService.class);
        textExtractionService = mock(ResumeTextExtractionService.class);
        service = new ResumeService(resumeRepository, fileStorageService, textExtractionService);
    }

    @Test
    void uploadsPdfExtractsTextAndSavesResume() {
        MockMultipartFile file = pdf("resume.pdf");
        when(fileStorageService.storeFile(file)).thenReturn("/uploads/resume.pdf");
        when(textExtractionService.extractText("/uploads/resume.pdf", "application/pdf"))
                .thenReturn("Java and Spring experience");
        when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.uploadResume(9L, file, false);

        assertEquals("resume.pdf", response.getFileName());
        assertEquals("application/pdf", response.getFileType());
        assertFalse(response.isPrimaryResume());
        assertEquals("Resume uploaded successfully", response.getMessage());
        ArgumentCaptor<Resume> captor = ArgumentCaptor.forClass(Resume.class);
        verify(resumeRepository).save(captor.capture());
        assertEquals(9L, captor.getValue().getCandidateId());
        assertEquals("/uploads/resume.pdf", captor.getValue().getFileUrl());
        assertEquals("Java and Spring experience", captor.getValue().getExtractedText());
    }

    @Test
    void promotesNewPrimaryAndDemotesPreviousResumes() {
        Resume previous = new Resume();
        previous.setCandidateId(9L);
        previous.setPrimaryResume(true);
        when(resumeRepository.findByCandidateId(9L)).thenReturn(List.of(previous));
        when(fileStorageService.storeFile(any())).thenReturn("/uploads/new.pdf");
        when(textExtractionService.extractText(anyString(), anyString())).thenReturn("text");
        when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.uploadResume(9L, pdf("new.pdf"), true);

        assertFalse(previous.isPrimaryResume());
        verify(resumeRepository).saveAll(List.of(previous));
        assertTrue(response.isPrimaryResume());
    }

    @Test
    void rejectsMissingOrEmptyFileBeforeStorage() {
        assertThrows(BadRequestException.class, () -> service.uploadResume(9L, null, false));
        assertThrows(BadRequestException.class,
                () -> service.uploadResume(9L,
                        new MockMultipartFile("file", "empty.pdf", "application/pdf", new byte[0]), false));

        verifyNoInteractions(fileStorageService, textExtractionService, resumeRepository);
    }

    @Test
    void rejectsUnsupportedFileType() {
        MockMultipartFile file = new MockMultipartFile("file", "resume.txt", "text/plain", "text".getBytes());

        assertEquals("Only PDF, DOC, and DOCX files are supported",
                assertThrows(BadRequestException.class, () -> service.uploadResume(9L, file, false)).getMessage());
        verifyNoInteractions(fileStorageService, textExtractionService, resumeRepository);
    }

    @Test
    void ownerAndReviewersCanViewResumeButOtherCandidatesCannot() {
        Resume resume = new Resume();
        resume.setCandidateId(9L);
        when(resumeRepository.findById(4L)).thenReturn(Optional.of(resume));

        assertSame(resume, service.getResumeForViewer(4L, 9L, "JOB_SEEKER"));
        assertSame(resume, service.getResumeForViewer(4L, 22L, "EMPLOYER"));
        assertSame(resume, service.getResumeForViewer(4L, 22L, "ADMIN"));
        assertThrows(UnauthorizedException.class,
                () -> service.getResumeForViewer(4L, 22L, "JOB_SEEKER"));
    }

    @Test
    void onlyOwnerCanDeleteResume() {
        Resume resume = new Resume();
        resume.setCandidateId(9L);
        when(resumeRepository.findById(4L)).thenReturn(Optional.of(resume));

        assertThrows(UnauthorizedException.class, () -> service.deleteResume(4L, 22L));
        verify(resumeRepository, never()).delete(any());

        service.deleteResume(4L, 9L);
        verify(resumeRepository).delete(resume);
    }

    @Test
    void missingResumeRaisesNotFound() {
        when(resumeRepository.findById(404L)).thenReturn(Optional.empty());

        assertEquals("Resume not found", assertThrows(ResourceNotFoundException.class,
                () -> service.getResume(404L)).getMessage());
    }

    private MockMultipartFile pdf(String fileName) {
        return new MockMultipartFile("file", fileName, "application/pdf", "%PDF-1.4 content".getBytes());
    }
}
