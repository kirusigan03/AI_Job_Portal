package com.smartjob.application_service.event;

public class ApplicationSubmittedEvent {

    private Long applicationId;

    private Long jobId;

    private Long candidateId;

    private Long resumeId;

    public ApplicationSubmittedEvent() {
    }

    public ApplicationSubmittedEvent(
            Long applicationId,
            Long jobId,
            Long candidateId,
            Long resumeId
    ) {
        this.applicationId = applicationId;
        this.jobId = jobId;
        this.candidateId = candidateId;
        this.resumeId = resumeId;
    }

    public Long getApplicationId() {
        return applicationId;
    }

    public Long getJobId() {
        return jobId;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public Long getResumeId() {
        return resumeId;
    }
}