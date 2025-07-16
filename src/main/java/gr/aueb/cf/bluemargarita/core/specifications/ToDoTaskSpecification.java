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


    public static Specification<ToDoTask> isPending() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"), TaskStatus.PENDING);
    }

    public static Specification<ToDoTask> isCompleted() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"), TaskStatus.COMPLETED);
    }

    public static Specification<ToDoTask> isCancelled() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"), TaskStatus.CANCELLED);
    }

    public static Specification<ToDoTask> isOverdue() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.and(
                        criteriaBuilder.equal(root.get("status"), TaskStatus.PENDING),
                        criteriaBuilder.lessThan(root.get("date"), LocalDate.now())
                );
    }

    public static Specification<ToDoTask> isDueToday() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.and(
                        criteriaBuilder.equal(root.get("status"), TaskStatus.PENDING),
                        criteriaBuilder.equal(root.get("date"), LocalDate.now())
                );
    }

    public static Specification<ToDoTask> isDueThisWeek() {
        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.and(
                        criteriaBuilder.equal(root.get("status"), TaskStatus.PENDING),
                        criteriaBuilder.between(root.get("date"), today.plusDays(1), endOfWeek)
                );
    }

    public static Specification<ToDoTask> isOverdueOrDueToday() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.and(
                        criteriaBuilder.equal(root.get("status"), TaskStatus.PENDING),
                        criteriaBuilder.lessThanOrEqualTo(root.get("date"), LocalDate.now())
                );
    }



}
