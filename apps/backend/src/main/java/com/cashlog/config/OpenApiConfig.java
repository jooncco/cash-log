package com.cashlog.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI cashLogOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Cash Log API")
                        .description("Personal finance tracking application API")
                        .version("1.0.0"));
    }
}
