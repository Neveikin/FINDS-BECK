package com.Finds.dev.Exceptions;

import jakarta.persistence.EntityNotFoundException;
import org.slf4j.ILoggerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.security.access.AccessDeniedException;
import java.time.LocalDateTime;

@ControllerAdvice
public class ExceptionalHandler {

    private static final Logger log = LoggerFactory.getLogger(ExceptionalHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleServerException (Exception e) {
        log.error("Handle INTERNAL_SERVER_ERROR exception", e);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponseDto(
                        "Server Error",
                        e.getMessage(),
                        LocalDateTime.now()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> ValidException (MethodArgumentNotValidException e) {
        log.error("Handle INTERNAL_SERVER_ERROR exception", e);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ErrorResponseDto(
                        "Valid Error",
                        e.getMessage(),
                        LocalDateTime.now()
                ));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponseDto> handleRoleException (AccessDeniedException e) {
        log.error("Handle FORBIDDEN exception", e);

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                new ErrorResponseDto(
                        "Access forbidden",
                        e.getMessage(),
                        LocalDateTime.now()
                ));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFindException (EntityNotFoundException e) {
        log.error("Handle NOT_FOUND exception", e);

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ErrorResponseDto(
                        "Not found",
                        e.getMessage(),
                        LocalDateTime.now()
                ));
    }


    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponseDto> handleBadRequest(IllegalArgumentException e) {
        log.error("Handle BAD_REQUEST exception", e);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                new ErrorResponseDto(
                        "Illegal Argument",
                        e.getMessage(),
                        LocalDateTime.now()
                ));
    }


}
