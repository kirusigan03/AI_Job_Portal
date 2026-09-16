package com.smartjob.user_service.exception;

public class DuplicateProfileException extends RuntimeException {

    public DuplicateProfileException(String message) {
        super(message);
    }
}