package com.Finds.dev.Services;

import com.Finds.dev.DTO.Auth.EmailConfirmDTO;
import com.Finds.dev.Entity.Cart;
import com.Finds.dev.Entity.User;
import com.Finds.dev.Redis.RedisService;
import com.Finds.dev.Repositories.CartRepository;
import com.Finds.dev.Repositories.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Service
public class MailConfirmService {
    @Autowired
    RedisService redisService;

    @Autowired
    UserRepository userRepository;

    @Autowired
    CartRepository cartRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final JavaMailSender mailSender;

    public MailConfirmService(JavaMailSender mailSender) {
            this.mailSender = mailSender;
    }

    public String generateCode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(90000) + 10000;
        return String.valueOf(code);
    }


    @Transactional
    public void sendCode(String to) {
        String code = generateCode();
        
        if (redisService.exists("comf:" + to + ":TTN"))
            throw new IllegalArgumentException("Please wait to receive a new code");

        Object value = redisService.getValue("comf:" + to + ":TTW");
        if (value != null && value instanceof Integer && (Integer) value >= 5) {
            throw new IllegalArgumentException("Please wait 10 minutes before retrying confirmation");
        }

        String htmlContent = "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }" +
                ".container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }" +
                ".header { text-align: center; margin-bottom: 30px; }" +
                ".avatar { width: 80px; height: 80px; border-radius: 50%; margin-bottom: 20px; }" +
                ".brand { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 10px; }" +
                ".code { font-size: 32px; font-weight: bold; color: #007bff; background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0; letter-spacing: 3px; }" +
                ".footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<img src='cid:avatar' alt='FINDS Avatar' class='avatar' />" +
                "<div class='brand'>FINDS</div>" +
                "</div>" +
                "<h3> Код подтверждения</h3>" +
                "<div class='code'>" + code + "</div>" +
                "<p><strong>Этот код действителен 5 минут.</strong></p>" +
                "<p>Если вы не запрашивали код, проигнорируйте это письмо.</p>" +
                "<div class='footer'>" +
                "<p>© 2026 FINDS. Все права защищены.</p>" +
                "<p>🛍 Твое место находок</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";

        mailSender.send(new MimeMessagePreparator() {
            public void prepare(MimeMessage mimeMessage) throws MessagingException {
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setTo(to);
                helper.setFrom("FINDS 🛍 <no-reply@finds-shop.ru>");
                helper.setSubject("🔐 Код подтверждения FINDS");
                helper.setText(htmlContent, true);
                
                helper.addInline("avatar", new ClassPathResource("static/emailAvatar.jpeg"));
            }
        });
        
        redisService.saveValue("comf:" + to, code, RedisService.DurationType.M, 5);

        redisService.incrementValueWithTTL("comf:" + to + ":TTN", RedisService.DurationType.M, 1);

        redisService.incrementValueWithTTL("comf:" + to + ":TTW", RedisService.DurationType.M, 10);

    }

    @Transactional
    public void confirm(EmailConfirmDTO emailConfirmDTO) {
        String code = (String) redisService.getValue("comf:" + emailConfirmDTO.email());

        if (code != null && code.equals(emailConfirmDTO.code())) {
            User user = objectMapper.convertValue(
                    redisService.getValue(redisService.getUserConfKey(emailConfirmDTO.email())),
                    User.class
            );
            user.setStatus(User.UserStatus.CONFIRMED);

            userRepository.save(user);
            cartRepository.save(new Cart(user));
        } else {
            throw new IllegalArgumentException("Invalid confirmation code");
        }

        redisService.deleteValue("comf:" + emailConfirmDTO.email());
    }

}
