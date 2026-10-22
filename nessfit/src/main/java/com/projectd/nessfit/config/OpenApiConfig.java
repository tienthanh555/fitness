package com.projectd.nessfit.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI nessfitOpenApi() {
        return new OpenAPI().info(new Info()
                .title("NessFit API")
                .version("v1")
                .description("REST API for the NessFit fitness management application."));
    }
}
