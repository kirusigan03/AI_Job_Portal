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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AiAnalysisService.class);

    private final ResumeAnalysisRepository analysisRepository;
    private final ResumeClient resumeClient;
    private final JobClient jobClient;
    private final OpenAiService openAiService;
    private final AiEvaluationValidator validator;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public AiAnalysisService(
            ResumeAnalysisRepository analysisRepository,
            ResumeClient resumeClient,
            JobClient jobClient,
            OpenAiService openAiService,
            AiEvaluationValidator validator,
            KafkaTemplate<String, Object> kafkaTemplate
    ) {
        this.analysisRepository = analysisRepository;
        this.resumeClient = resumeClient;
        this.jobClient = jobClient;
        this.openAiService = openAiService;
        this.validator = validator;
        this.kafkaTemplate = kafkaTemplate;
    }

    @KafkaListener(topics = "application-submitted", groupId = "ai-service")
    public void handleApplicationSubmitted(ApplicationSubmittedEvent event) {

        log.info("AI Service received application: {}", event.getApplicationId());

        if (event.getResumeId() == null) {
            log.info(
                    "No resume attached to application {}. Skipping AI analysis.",
                    event.getApplicationId()
            );
            return;
        }

        try {

            ResumeAnalysis saved = evaluate(event);

            log.info("AI evaluation completed for application: {}", saved.getApplicationId());

        } catch (Exception e) {

            // A failed AI call must never break the applicant's flow --
            // the application itself already succeeded before this
            // event was published. Log it and move on; the evaluation
            // can be retried/inspected later.
            log.error(
                    "AI evaluation failed for application {}: {}",
                    event.getApplicationId(),
                    e.getMessage()
            );
        }
    }

    public ResumeAnalysis evaluate(ApplicationSubmittedEvent event) {

        return analysisRepository
                .findByApplicationId(event.getApplicationId())
                .orElseGet(() -> runEvaluation(event));
    }

    private ResumeAnalysis runEvaluation(ApplicationSubmittedEvent event) {

        ResumeInternalResponse resume = resumeClient.getResume(event.getResumeId());
        JobInternalResponse job = jobClient.getJob(event.getJobId());

        if (resume.getExtractedText() == null || resume.getExtractedText().isBlank()) {
            throw new RuntimeException("Resume has no extracted text");
        }

        AiEvaluationResponse aiResult = openAiService.evaluateCandidate(
                resume.getExtractedText(),
                job.getTitle(),
                job.getDescription(),
                job.getExperienceRequired()
        );

        validator.validate(aiResult);

        ResumeAnalysis analysis = new ResumeAnalysis();
        analysis.setApplicationId(event.getApplicationId());
        analysis.setCandidateId(event.getCandidateId());
        analysis.setJobId(event.getJobId());
        analysis.setResumeId(event.getResumeId());
        analysis.setMatchScore(aiResult.getMatchScore());
        analysis.setSkillsScore(aiResult.getSkillsScore());
        analysis.setExperienceScore(aiResult.getExperienceScore());
        analysis.setEducationScore(aiResult.getEducationScore());
        analysis.setRecommendation(aiResult.getRecommendation());
        analysis.setExtractedSkills(join(aiResult.getExtractedSkills()));
        analysis.setMatchedSkills(join(aiResult.getMatchedSkills()));
        analysis.setMissingSkills(join(aiResult.getMissingSkills()));
        analysis.setReasoning(aiResult.getReasoning());

        ResumeAnalysis saved = analysisRepository.save(analysis);

        publishEvaluated(saved);

        return saved;
    }

    private void publishEvaluated(ResumeAnalysis saved) {

        CandidateEvaluatedEvent evaluatedEvent = new CandidateEvaluatedEvent();
        evaluatedEvent.setEvaluationId(saved.getId());
        evaluatedEvent.setApplicationId(saved.getApplicationId());
        evaluatedEvent.setCandidateId(saved.getCandidateId());
        evaluatedEvent.setJobId(saved.getJobId());
        evaluatedEvent.setResumeId(saved.getResumeId());
        evaluatedEvent.setMatchScore(saved.getMatchScore());
        evaluatedEvent.setRecommendation(saved.getRecommendation());

        kafkaTemplate.send(
                "candidate-evaluated",
                String.valueOf(saved.getApplicationId()),
                evaluatedEvent
        );
    }

    private String join(List<String> values) {

        if (values == null) {
            return "";
        }

        return values.stream().collect(Collectors.joining(", "));
    }
}
