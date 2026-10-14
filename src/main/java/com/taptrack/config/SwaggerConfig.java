package com.taptrack.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info().title("TapTrack API").version("v1"))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme().type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer").bearerFormat("JWT"))
                        .addSecuritySchemes("deviceKey",
                                new SecurityScheme().type(SecurityScheme.Type.APIKEY)
                                        .in(SecurityScheme.In.HEADER).name("X-Device-API-Key")));
    }
}