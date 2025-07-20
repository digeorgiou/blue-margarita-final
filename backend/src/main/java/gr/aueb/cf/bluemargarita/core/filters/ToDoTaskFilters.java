package gr.aueb.cf.bluemargarita.core.filters;

import gr.aueb.cf.bluemargarita.core.enums.TaskStatus;
import lombok.*;
import org.springframework.lang.Nullable;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class ToDoTaskFilters extends GenericFilters{

    @Nullable
    String description;

    @Nullable
    LocalDate dateFrom;

    @Nullable
    LocalDate dateTo;

    @Nullable
    TaskStatus status;
}
