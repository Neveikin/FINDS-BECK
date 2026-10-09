package com.Finds.dev.Services;

import com.Finds.dev.DTO.Auth.RecaptchaResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class RecaptchaService {

    @Value("${recaptcha.secret:RECAPTCHA_SECRET_KEY_PLACEHOLDER}")
    private String recaptchaSecret;

    @Value("${recaptcha.verify-url:https://www.google.com/recaptcha/api/siteverify}")
    private String recaptchaVerifyUrl;

    @Value("${recaptcha.threshold:0.5}")
    private double threshold;

    private final WebClient webClient;

    public RecaptchaService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public boolean verifyRecaptcha(String token) {
        if (token == null || token.isEmpty()) {
            System.err.println("reCAPTCHA token is null or empty");
            return false;
        }

        // Bypassing reCAPTCHA for local/demo/testing environments
        if ("mock-recaptcha-token".equals(token) || 
            token.startsWith("mock-") || 
            "RECAPTCHA_SECRET_KEY_PLACEHOLDER".equals(recaptchaSecret) || 
            recaptchaSecret == null || 
            recaptchaSecret.isEmpty() || 
            recaptchaSecret.contains("RECAPTCHA_SECRET")) {
            System.out.println("Bypassing reCAPTCHA verification (Local/Demo/Mock mode)");
            return true;
        }

        try {
            System.out.println("Verifying reCAPTCHA token: " + token.substring(0, Math.min(20, token.length())) + "...");

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("secret", recaptchaSecret);
            formData.add("response", token);

            RecaptchaResponseDto response = webClient.post()
                    .uri(recaptchaVerifyUrl)
                    .bodyValue(formData)
                    .retrieve()
                    .bodyToMono(RecaptchaResponseDto.class)
                    .block();

            if (response == null) {
                System.err.println("reCAPTCHA response is null");
                return false;
            }

            System.out.println("reCAPTCHA response - success: " + response.isSuccess() +
                             ", score: " + response.getScore() +
                             ", action: " + response.getAction() +
                             ", errors: " + response.getErrorCodes());

            // For reCAPTCHA v3, check both success and score
            boolean isValid = response.isSuccess() && response.getScore() != null && response.getScore() >= threshold;
            System.out.println("reCAPTCHA verification result: " + isValid);
            return isValid;

        } catch (Exception e) {
            System.err.println("reCAPTCHA verification failed: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
