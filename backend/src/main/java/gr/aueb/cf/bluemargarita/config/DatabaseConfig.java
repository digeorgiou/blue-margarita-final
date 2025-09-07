package gr.aueb.cf.bluemargarita.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;

@Configuration
@Profile("production")
public class DatabaseConfig {

    @Value("${DATABASE_URL}")
    private String databaseUrl;

    @Bean
    public DataSource dataSource() {
        String url = databaseUrl;

        // Add port if missing
        if (url.contains("frankfurt-postgres.render.com/") && !url.contains(":5432")) {
            url = url.replace("frankfurt-postgres.render.com/", "frankfurt-postgres.render.com:5432/");
        }

        // Convert postgresql:// to jdbc:postgresql://
        if (url.startsWith("postgresql://")) {
            url = url.replace("postgresql://", "jdbc:postgresql://");
        }

        return DataSourceBuilder
                .create()
                .url(url)
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}