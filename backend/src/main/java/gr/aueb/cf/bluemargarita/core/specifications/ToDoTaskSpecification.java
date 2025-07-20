package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.core.enums.TaskStatus;
import gr.aueb.cf.bluemargarita.model.Customer;
import gr.aueb.cf.bluemargarita.model.Sale;
import gr.aueb.cf.bluemargarita.model.ToDoTask;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class ToDoTaskSpecification {

    private ToDoTaskSpecification(){

    }

    public static Specification<ToDoTask> hasDateBetween(LocalDate startDate, LocalDate endDate){
        return (root, query, criteriaBuilder) -> {
            if (startDate == null && endDate == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            if (startDate == null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("date"), endDate);
            }
            if (endDate == null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("date"), startDate);
            }
            return criteriaBuilder.between(root.get("date"), startDate, endDate);
        };
    }

    public static Specification<ToDoTask> hasDescription(String description){
        return (root, query, criteriaBuilder) -> {
            if (description == null || description.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            String upperSearchTerm = "%" + description.toUpperCase() + "%";

            return criteriaBuilder.like(criteriaBuilder.upper(root.get("description")), upperSearchTerm);
        };
    }

    public static Specification<ToDoTask> hasTaskStatus(TaskStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

}
