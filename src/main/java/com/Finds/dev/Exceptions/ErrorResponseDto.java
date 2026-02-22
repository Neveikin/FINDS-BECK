package com.Finds.dev.Exceptions;

import java.time.LocalDateTime;

public record ErrorResponseDto(
        String mesage,
        String message_text,
        LocalDateTime time
) {
}
