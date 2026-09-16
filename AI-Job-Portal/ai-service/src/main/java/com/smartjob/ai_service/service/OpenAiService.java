package com.smartjob.ai_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartjob.ai_service.dto.AiEvaluationResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class OpenAiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.model}")
    private String model;

    public OpenAiService(RestClient openAiRestClient, ObjectMapper objectMapper) {
        this.restClient = openAiRestClient;
        this.objectMapper = objectMapper;
    }

    public AiEvaluationResponse evaluateCandidate(
            String resumeText,
            String jobTitle,
            String jobDescription,
            String experienceRequired
    ) {

        String prompt = buildPrompt(resumeText, jobTitle, jobDescription, experienceRequired);

        try {

            String requestBody = buildRequest(prompt);

            String response = restClient.post()
                    .uri("/v1/responses")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return parseResponse(response);

        } catch (Exception e) {
            throw new RuntimeException("AI candidate evaluation failed", e);
        }
    }

    private String buildRequest(String prompt) throws Exception {

        String escapedPrompt = objectMapper.writeValueAsString(prompt);

        return """
                {
                  "model": "%s",
                  "store": false,
                  "input": [
                    {
                      "role": "system",
                      "content": [
                        {
                          "type": "input_text",
                          "text": "You are an expert technical recruiter. Evaluate candidates objectively. Never invent information."
                        }
                      ]
                    },
                    {
                      "role": "user",
                      "content": [
                        {
                          "type": "input_text",
                          "text": %s
                        }
                      ]
                    }
                  ],
                  "text": {
                    "format": {
                      "type": "json_schema",
                      "name": "candidate_evaluation",
                      "description": "Structured candidate evaluation",
                      "strict": true,
                      "schema": {
                        "type": "object",
                        "properties": {
                          "matchScore": { "type": "integer", "minimum": 0, "maximum": 100 },
                          "skillsScore": { "type": "integer", "minimum": 0, "maximum": 100 },
                          "experienceScore": { "type": "integer", "minimum": 0, "maximum": 100 },
                          "educationScore": { "type": "integer", "minimum": 0, "maximum": 100 },
                          "recommendation": {
                            "type": "string",
                            "enum": ["STRONG_MATCH", "GOOD_MATCH", "WEAK_MATCH"]
                          },
                          "extractedSkills": { "type": "array", "items": { "type": "string" } },
                          "matchedSkills": { "type": "array", "items": { "type": "string" } },
                          "missingSkills": { "type": "array", "items": { "type": "string" } },
                          "reasoning": { "type": "string" }
                        },
                        "required": [
                          "matchScore", "skillsScore", "experienceScore", "educationScore",
                          "recommendation", "extractedSkills", "matchedSkills",
                          "missingSkills", "reasoning"
                        ],
                        "additionalProperties": false
                      }
                    }
                  }
                }
                """.formatted(model, escapedPrompt);
    }

    private String buildPrompt(
            String resumeText,
            String jobTitle,
            String jobDescription,
            String experienceRequired
    ) {

        return """
                Evaluate the candidate against this job.

                JOB TITLE:
                %s

                JOB DESCRIPTION:
                %s

                REQUIRED EXPERIENCE:
                %s

                CANDIDATE RESUME:
                %s

                Evaluation rules:

                1. Match the candidate only against the supplied job.
                2. Do not invent skills, education or experience.
                3. Extract technical and relevant professional skills.
                4. Identify which required skills are present.
                5. Identify important missing skills.
                6. Evaluate experience relevance.
                7. Evaluate education relevance.
                8. Give scores from 0 to 100.
                9. Give a recommendation:
                   - STRONG_MATCH: highly suitable
                   - GOOD_MATCH: reasonably suitable
                   - WEAK_MATCH: significant gaps
                10. Keep reasoning concise and factual.

                Return the requested structured result.
                """.formatted(jobTitle, jobDescription, experienceRequired, resumeText);
    }

    private AiEvaluationResponse parseResponse(String response) {

        try {

            JsonNode root = objectMapper.readTree(response);
            JsonNode output = root.path("output");

            if (!output.isArray() || output.isEmpty()) {
                throw new RuntimeException("AI response contains no output");
            }

            String outputText = null;

            for (JsonNode item : output) {

                JsonNode content = item.path("content");

                if (!content.isArray()) {
                    continue;
                }

                for (JsonNode contentItem : content) {

                    if ("output_text".equals(contentItem.path("type").asText())) {
                        outputText = contentItem.path("text").asText();
                        break;
                    }
                }

                if (outputText != null) {
                    break;
                }
            }

            if (outputText == null || outputText.isBlank()) {
                throw new RuntimeException("AI returned empty output");
            }

            return objectMapper.readValue(outputText, AiEvaluationResponse.class);

        } catch (Exception e) {
            throw new RuntimeException("Unable to parse structured AI response", e);
        }
    }
}
