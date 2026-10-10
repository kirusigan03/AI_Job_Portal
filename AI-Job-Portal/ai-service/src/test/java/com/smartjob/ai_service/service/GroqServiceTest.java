package com.smartjob.ai_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartjob.ai_service.config.GroqConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class GroqServiceTest {
    private static final String URL = "https://api.groq.com/openai/v1/chat/completions";
    private final ObjectMapper mapper = new ObjectMapper();
    private MockRestServiceServer server;
    private GroqService service;
    private static final String RESULT = """
        {"matchScore":80,"skillsScore":85,"experienceScore":75,"educationScore":70,
         "recommendation":"GOOD_MATCH","extractedSkills":["Java"],"matchedSkills":["Java"],
         "missingSkills":["Kafka"],"reasoning":"Relevant Java experience."}
        """;

    @BeforeEach
    void setup() {
        RestClient.Builder builder = new GroqConfig()
            .groqRestClient("https://api.groq.com/openai/v1", "test-key").mutate();
        server = MockRestServiceServer.bindTo(builder).build();
        service = new GroqService(builder.build(), mapper, "openai/gpt-oss-20b");
    }

    @Test
    void sendsGroqContractAndParsesStructuredEvaluation() throws Exception {
        server.expect(requestTo(URL)).andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer test-key"))
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.model").value("openai/gpt-oss-20b"))
                .andExpect(jsonPath("$.messages[0].role").value("system"))
                .andExpect(jsonPath("$.messages[1].role").value("user"))
                .andExpect(jsonPath("$.messages[1].content").value(org.hamcrest.Matchers.containsString("Java \"developer\"\nResume")))
                .andExpect(jsonPath("$.response_format.type").value("json_object"))
                .andRespond(withSuccess(response("stop", RESULT), MediaType.APPLICATION_JSON));
        var result = service.evaluateCandidate("Java \"developer\"\nResume", "Developer", "Java", "2 years");
        new AiEvaluationValidator().validate(result);
        assertEquals(80, result.getMatchScore());
        assertEquals(List.of("Kafka"), result.getMissingSkills());
        server.verify();
    }

    @Test
    void skipsThoughtPartsAndCombinesOutputParts() throws Exception {
        String body = response("stop", RESULT);
        server.expect(requestTo(URL)).andRespond(withSuccess(body, MediaType.APPLICATION_JSON));
        assertEquals("GOOD_MATCH", evaluate().getRecommendation());
        server.verify();
    }

    @Test
    void rejectsMissingChoices() {
        server.expect(requestTo(URL)).andRespond(withSuccess(
                "{}", MediaType.APPLICATION_JSON));
        assertTrue(assertThrows(IllegalStateException.class, this::evaluate).getCause().getMessage().contains("no candidate"));
        server.verify();
    }

    @Test
    void rejectsTruncatedOutputEvenIfItContainsValidJson() throws Exception {
        server.expect(requestTo(URL)).andRespond(withSuccess(
                response("length", RESULT), MediaType.APPLICATION_JSON));
        assertTrue(assertThrows(IllegalStateException.class, this::evaluate).getCause().getMessage().contains("length"));
        server.verify();
    }

    @Test
    void rejectsMissingCandidatesAndMalformedJson() {
        server.expect(requestTo(URL)).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        server.expect(requestTo(URL)).andRespond(withSuccess("not-json", MediaType.APPLICATION_JSON));
        assertThrows(IllegalStateException.class, this::evaluate);
        assertThrows(IllegalStateException.class, this::evaluate);
        server.verify();
    }

    @Test
    void preservesProviderErrorAsCause() {
        server.expect(requestTo(URL)).andRespond(withStatus(HttpStatus.FORBIDDEN)
                .body("{\"error\":{\"message\":\"API key not valid\"}}").contentType(MediaType.APPLICATION_JSON));
        var error = assertThrows(IllegalStateException.class, this::evaluate);
        assertTrue(error.getCause().getMessage().contains("403"));
        server.verify();
    }

    private com.smartjob.ai_service.dto.AiEvaluationResponse evaluate() {
        return service.evaluateCandidate("Java", "Developer", "Java", "2 years");
    }

    private String response(String reason, String content) throws Exception {
        return mapper.writeValueAsString(Map.of("choices", List.of(Map.of(
                "finish_reason", reason,
                "message", Map.of("role", "assistant", "content", content)))));
    }
}
