package gr.aueb.cf.bluemargarita.core.filters;

import lombok.*;
import org.springframework.lang.Nullable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class SupplierFilters extends GenericFilters {

    @Nullable
    private String name;

    @Nullable
    private String email;

    @Nullable
    private String tin;

    @Nullable
    private String phoneNumber;

    @Nullable
    private String address;

    @Nullable
    private String searchTerm;

    @Nullable
    private Boolean isActive;
}
