package gr.aueb.cf.bluemargarita.authentication;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(
        name = "Bearer Authentication",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        scheme = "bearer"
)
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Blue Margarita API")
                        .version("1.0.0")
                        .description("ERP for jewelry retail store")
                        .contact(new Contact()
                                .name("Admin")
                                .email("digeo@gmail.com")
                                .url("https://cf.gr"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache" +
                                        ".org/licenses/LICENSE-2.0")
                        )
                );
    }
}
