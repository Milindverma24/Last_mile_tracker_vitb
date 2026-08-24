package com.gatiman;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
@EnableAsync
public class GatimanApplication {

    public static void main(String[] args) {
        loadEnvFile();
        SpringApplication.run(GatimanApplication.class, args);
    }

    private static void loadEnvFile() {
        File[] envFiles = new File[] {
            new File("../.env"),
            new File(".env"),
            new File(System.getProperty("user.dir"), ".env"),
            new File(System.getProperty("user.dir"), "../.env")
        };

        for (File envFile : envFiles) {
            if (envFile.exists() && envFile.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(envFile.toPath());
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) {
                            continue;
                        }
                        int eqIdx = trimmed.indexOf('=');
                        String key = trimmed.substring(0, eqIdx).trim();
                        String value = trimmed.substring(eqIdx + 1).trim();

                        // Strip optional quotes
                        if ((value.startsWith("\"") && value.endsWith("\"")) ||
                            (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }

                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                        }
                    }
                    break;
                } catch (Exception ignored) {
                }
            }
        }
    }
}
