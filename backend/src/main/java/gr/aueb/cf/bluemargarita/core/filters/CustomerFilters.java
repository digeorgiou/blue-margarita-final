package gr.aueb.cf.bluemargarita.core.filters;

import lombok.*;
import org.springframework.lang.Nullable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class CustomerFilters extends GenericFilters{

    @Nullable
    private String email;

    @Nullable
    private String lastname;

    @Nullable
    private String tin;

    @Nullable
    private String phoneNumber;

    @Nullable
    private Boolean isActive;

    @Nullable
    private String searchTerm;

    @Nullable
    private Boolean wholesaleOnly;
}
