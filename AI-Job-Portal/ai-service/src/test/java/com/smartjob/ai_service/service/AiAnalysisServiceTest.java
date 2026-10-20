package com.smartjob.ai_service.service;

import com.smartjob.ai_service.client.JobClient;
import com.smartjob.ai_service.client.ResumeClient;
import com.smartjob.ai_service.dto.AiEvaluationResponse;
import com.smartjob.ai_service.dto.JobInternalResponse;
import com.smartjob.ai_service.dto.ResumeInternalResponse;
import com.smartjob.ai_service.entity.ResumeAnalysis;
import com.smartjob.ai_service.event.ApplicationSubmittedEvent;
import com.smartjob.ai_service.event.CandidateEvaluatedEvent;
import com.smartjob.ai_service.repository.ResumeAnalysisRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class AiAnalysisServiceTest {

    private ResumeAnalysisRepository analysisRepository;
    private ResumeClient resumeClient;
    private JobClient jobClient;
    private GroqService groqService;
    private AiEvaluationValidator validator;
    private KafkaTemplate<String, Object> kafkaTemplate;
    private AiAnalysisService service;

    @BeforeEach
    @SuppressWarnings("unchecked")
    void setUp() {
        analysisRepository = mock(ResumeAnalysisRepository.class);
        resumeClient = mock(ResumeClient.class);
        jobClient = mock(JobClient.class);
        groqService = mock(GroqService.class);
        validator = mock(AiEvaluationValidator.class);
        kafkaTemplate = mock(KafkaTemplate.class);
        service = new AiAnalysisService(
                analysisRepository, resumeClient, jobClient, groqService, validator, kafkaTemplate);
    }

    @Test
    void returnsExistingAnalysisWithoutRepeatingExternalWork() {
        ApplicationSubmittedEvent event = event(20L, 7L, 8L, 9L);
        ResumeAnalysis existing = new ResumeAnalysis();
        existing.setApplicationId(20L);
        when(analysisRepository.findByApplicationId(20L)).thenReturn(Optional.of(existing));

        assertSame(existing, service.evaluate(event));

        verify(analysisRepository, never()).save(any());
        verifyNoInteractions(resumeClient, jobClient, groqService, validator, kafkaTemplate);
    }

    @Test
    void evaluatesResumePersistsScoresAndPublishesCandidateEvent() {
        ApplicationSubmittedEvent event = event(20L, 7L, 8L, 9L);
        ResumeInternalResponse resume = new ResumeInternalResponse();
        resume.setExtractedText("Java and Spring experience");
        JobInternalResponse job = new JobInternalResponse();
        job.setTitle("Backend Engineer");
        job.setDescription("Build APIs");
        job.setExperienceRequired("2 years");
        when(analysisRepository.findByApplicationId(20L)).thenReturn(Optional.empty());
        when(resumeClient.getResume(9L)).thenReturn(resume);
        when(jobClient.getJob(8L)).thenReturn(job);
        when(groqService.evaluateCandidate("Java and Spring experience", "Backend Engineer", "Build APIs", "2 years"))
                .thenReturn(evaluation());
        when(analysisRepository.save(any(ResumeAnalysis.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ResumeAnalysis saved = service.evaluate(event);

        assertEquals(20L, saved.getApplicationId());
        assertEquals(7L, saved.getCandidateId());
        assertEquals(8L, saved.getJobId());
        assertEquals(9L, saved.getResumeId());
        assertEquals(88, saved.getMatchScore());
        assertEquals("Java, Spring", saved.getExtractedSkills());
        assertEquals("Java", saved.getMatchedSkills());
        assertEquals("Kafka", saved.getMissingSkills());
        verify(validator).validate(any(AiEvaluationResponse.class));

        ArgumentCaptor<Object> published = ArgumentCaptor.forClass(Object.class);
        verify(kafkaTemplate).send(eq("candidate-evaluated"), eq("20"), published.capture());
        CandidateEvaluatedEvent notification = (CandidateEvaluatedEvent) published.getValue();
        assertEquals(20L, notification.getApplicationId());
        assertEquals(7L, notification.getCandidateId());
        assertEquals(88, notification.getMatchScore());
        assertEquals("GOOD_MATCH", notification.getRecommendation());
    }

    @Test
    void skipsEventWithoutResume() {
        ApplicationSubmittedEvent event = event(20L, 7L, 8L, null);

        assertDoesNotThrow(() -> service.handleApplicationSubmitted(event));

        verifyNoInteractions(analysisRepository, resumeClient, jobClient, groqService, validator, kafkaTemplate);
    }

    @Test
    void reportsBlankExtractedResumeTextAndDoesNotCallAiProvider() {
        ApplicationSubmittedEvent event = event(20L, 7L, 8L, 9L);
        ResumeInternalResponse resume = new ResumeInternalResponse();
        resume.setExtractedText("  ");
        when(analysisRepository.findByApplicationId(20L)).thenReturn(Optional.empty());
        when(resumeClient.getResume(9L)).thenReturn(resume);
        when(jobClient.getJob(8L)).thenReturn(new JobInternalResponse());

        IllegalStateException error = assertThrows(IllegalStateException.class,
                () -> service.handleApplicationSubmitted(event));

        assertEquals("AI evaluation failed for application 20", error.getMessage());
        assertEquals("Resume has no extracted text", error.getCause().getMessage());
        verifyNoInteractions(groqService, kafkaTemplate);
        verify(analysisRepository, never()).save(any());
    }

    private ApplicationSubmittedEvent event(Long applicationId, Long candidateId, Long jobId, Long resumeId) {
        ApplicationSubmittedEvent event = new ApplicationSubmittedEvent();
        event.setApplicationId(applicationId);
        event.setCandidateId(candidateId);
        event.setJobId(jobId);
        event.setResumeId(resumeId);
        return event;
    }

    private AiEvaluationResponse evaluation() {
        AiEvaluationResponse result = new AiEvaluationResponse();
        result.setMatchScore(88);
        result.setSkillsScore(90);
        result.setExperienceScore(84);
        result.setEducationScore(80);
        result.setRecommendation("GOOD_MATCH");
        result.setExtractedSkills(List.of("Java", "Spring"));
        result.setMatchedSkills(List.of("Java"));
        result.setMissingSkills(List.of("Kafka"));
        result.setReasoning("Relevant backend experience");
        return result;
    }
}
