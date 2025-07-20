package gr.aueb.cf.bluemargarita.core.filters;

import lombok.*;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class MaterialFilters extends GenericFilters {

    @Nullable
    private String name;

    @Nullable
    private Boolean isActive;
}
