package com.gatiman.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
@Slf4j
public class MailConfig {

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String host;

    @Value("${spring.mail.port:465}")
    private int port;

    @Value("${spring.mail.username:}")
    private String username;

    @Value("${spring.mail.password:}")
    private String password;

    @Bean
    @Primary
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(password);
        mailSender.setDefaultEncoding("UTF-8");

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");

        if (port == 465) {
            // Port 465 SMTPS (Implicit SSL) configuration for Jakarta / Angus Mail
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
            props.put("mail.smtp.ssl.trust", "*");
            log.info("JavaMailSender initialized with SMTPS/SSL (Port 465) for host: {}", host);
        } else {
            // Port 587 STARTTLS configuration
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.ssl.protocols", "TLSv1.2 TLSv1.3");
            props.put("mail.smtp.ssl.trust", "*");
            log.info("JavaMailSender initialized with STARTTLS (Port {}) for host: {}", port, host);
        }

        return mailSender;
    }
}
