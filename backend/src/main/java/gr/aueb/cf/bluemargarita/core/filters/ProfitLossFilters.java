package gr.aueb.cf.bluemargarita.core.filters;

import lombok.*;
import org.springframework.lang.Nullable;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class ProfitLossFilters extends GenericFilters{

    @Nullable
    LocalDate dateFrom;

    @Nullable
    LocalDate dateTo;
}
