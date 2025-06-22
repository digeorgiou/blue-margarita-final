package gr.aueb.cf.bluemargarita;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class BluemargaritaApplication {

	public static void main(String[] args) {
		SpringApplication.run(BluemargaritaApplication.class, args);
	}

}
