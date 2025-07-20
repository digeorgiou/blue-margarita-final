package gr.aueb.cf.bluemargarita.core.filters;

import lombok.*;
import org.springframework.lang.Nullable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class CategoryFilters extends GenericFilters {

    @Nullable
    private String name;

    @Nullable
    private Boolean isActive;

}
