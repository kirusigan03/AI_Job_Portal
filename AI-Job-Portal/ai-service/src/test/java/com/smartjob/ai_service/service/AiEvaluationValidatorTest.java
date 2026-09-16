package com.smartjob.ai_service.service;

import com.smartjob.ai_service.dto.AiEvaluationResponse;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AiEvaluationValidatorTest {

    private final AiEvaluationValidator validator = new AiEvaluationValidator();

    @Test
    void validResultPassesValidation() {

        AiEvaluationResponse result = validResponse();

        assertDoesNotThrow(() -> validator.validate(result));
    }

    @Test
    void nullResultIsRejected() {

        assertThrows(RuntimeException.class, () -> validator.validate(null));
    }

    @Test
    void scoreAboveHundredIsRejected() {

        AiEvaluationResponse result = validResponse();
        result.setMatchScore(150);

        assertThrows(RuntimeException.class, () -> validator.validate(result));
    }

    @Test
    void negativeScoreIsRejected() {

        AiEvaluationResponse result = validResponse();
        result.setSkillsScore(-1);

        assertThrows(RuntimeException.class, () -> validator.validate(result));
    }

    @Test
    void missingRecommendationIsRejected() {

        AiEvaluationResponse result = validResponse();
        result.setRecommendation(null);

        assertThrows(RuntimeException.class, () -> validator.validate(result));
    }

    @Test
    void blankReasoningIsRejected() {

        AiEvaluationResponse result = validResponse();
        result.setReasoning("   ");

        assertThrows(RuntimeException.class, () -> validator.validate(result));
    }

    private AiEvaluationResponse validResponse() {

        AiEvaluationResponse result = new AiEvaluationResponse();
        result.setMatchScore(90);
        result.setSkillsScore(85);
        result.setExperienceScore(80);
        result.setEducationScore(75);
        result.setRecommendation("STRONG_MATCH");
        result.setExtractedSkills(List.of("Java", "Spring Boot"));
        result.setMatchedSkills(List.of("Java"));
        result.setMissingSkills(List.of("Docker"));
        result.setReasoning("Strong technical match");

        return result;
    }
}
