package com.smartjob.ai_service.service;

import com.smartjob.ai_service.dto.AiEvaluationResponse;
import org.springframework.stereotype.Component;

@Component
public class AiEvaluationValidator {

    public void validate(AiEvaluationResponse result) {

        if (result == null) {
            throw new RuntimeException("AI result is null");
        }

        validateScore(result.getMatchScore(), "matchScore");
        validateScore(result.getSkillsScore(), "skillsScore");
        validateScore(result.getExperienceScore(), "experienceScore");
        validateScore(result.getEducationScore(), "educationScore");

        if (result.getRecommendation() == null || result.getRecommendation().isBlank()) {
            throw new RuntimeException("AI recommendation is missing");
        }

        if (result.getReasoning() == null || result.getReasoning().isBlank()) {
            throw new RuntimeException("AI reasoning is missing");
        }
    }

    private void validateScore(Integer score, String field) {

        if (score == null || score < 0 || score > 100) {
            throw new RuntimeException("Invalid AI " + field);
        }
    }
}
