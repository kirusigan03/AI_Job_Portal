# What changed in this update

Everything below was added/rewritten against the actual code you uploaded, following
the dependency order from the earlier status doc.

## Resume upload (resume-service)
- Real multipart file upload (`POST /api/resumes/upload`) replacing the JSON-only endpoint
- `FileStorageService` (PDF/DOCX only, UUID-named files, path-traversal guard)
- `ResumeTextExtractionService` (PDFBox for PDF, Apache POI for DOCX)
- `Resume.extractedText` switched to `@Lob` (no more fixed-length truncation)
- Ownership check added on `GET /api/resumes/{id}` (previously any authenticated user could view any resume)
- New `/internal/resumes/{id}` endpoint, guarded by `X-Internal-Service-Key`

## Real AI evaluation (ai-service)
- `ResumeClient` / `JobClient` Feign clients calling the new internal endpoints
- `OpenAiService`: calls the OpenAI Responses API with a strict `json_schema` structured output
- `AiEvaluationValidator`: sanity-checks scores/fields before anything is saved
- `ResumeAnalysis` entity extended to a full evaluation record (applicationId, matchScore, recommendation, matchedSkills, reasoning, etc.)
- Publishes `candidate-evaluated` to Kafka after saving
- New `GET /api/ai/applications/{applicationId}` endpoint, plus ownership checks on both AI endpoints
- The old hardcoded `overallScore = 75` block is gone

## Internal service-to-service security
- `internal.service-key` + `X-Internal-Service-Key` header pattern, used by ai-service and notification-service to call resume-service / job-service / user-service without a user JWT (Kafka-triggered flows have none to carry)

## Email notifications (notification-service)
- `EmailService` (the `spring-boot-starter-mail` dependency was already in the pom, just unused)
- `UserClient` Feign client resolves `candidateId -> email` via user-service's new internal endpoint
- Emails now sent on both `application-status-changed` and the new `candidate-evaluated` consumer
- Fixed a broken import in `KafkaConsumerConfig` (it referenced `CandidateEvaluatedEvent` without importing/creating it)

## Global exception handling
- Added to `ai-service`, `auth-service`, `job-service`, `resume-service`, `notification-service` (matching the pattern already used in `application-service`/`user-service`)
- Raw `throw new RuntimeException(...)` calls in controllers/services replaced with typed exceptions (`ResourceNotFoundException`, `BadRequestException`, `UnauthorizedException`)

## Security/ownership cleanup
- `job-service`: `PUT /{id}/status` and `DELETE /{id}` previously had **no ownership check at all** — any authenticated user could edit/delete any job. Now restricted to the owning employer (or ADMIN).
- `resume-service`: same gap fixed for viewing a resume by ID.

## Docker
- `docker-compose.yml`: added a `postgres` service (with `docker/postgres/init.sql` creating all 7 databases) alongside the existing Kafka
- `docker-compose.full.yml`: full-stack compose wiring every service together (needs jars built first — see the comment at the top of the file)
- `Dockerfile` added to every service

## Tests
- `AiEvaluationValidatorTest` (ai-service) and `FileStorageServiceTest` (resume-service) — real unit tests, no DB/Spring context needed
- Everything else still has only the placeholder `contextLoads()` test; a full suite (auth, jobs, applications, resumes end-to-end) is a bigger lift than fits in one pass — happy to keep going on specific services if you want it

## CI/CD
- `.github/workflows/backend-ci.yml`: matrix build (`mvn clean verify`) across all 10 services on push/PR, with CI-only placeholder secrets

## Config / .env
- `.env` and `.env.example` updated with `INTERNAL_SERVICE_KEY`, `OPENAI_API_KEY`, `MAIL_USERNAME`, `MAIL_PASSWORD` placeholders — **fill these in before running** ai-service or notification-service
- `api-gateway`: bumped `spring.codec.max-in-memory-size` so multipart resume uploads pass through cleanly

## Before you run it
1. Fill in the new `.env` values (OpenAI key, a random internal service key, Gmail app password)
2. `docker compose up -d` (now brings up Postgres + Kafka)
3. Start services in order: config-server → eureka-server → auth/user/job/resume/application → ai-service → notification-service → api-gateway
4. Test through the gateway: register → login → create job → upload a real PDF/DOCX resume → apply → watch Kafka logs for the AI evaluation → check `GET /api/ai/applications/{id}` → check your inbox for the evaluation email
