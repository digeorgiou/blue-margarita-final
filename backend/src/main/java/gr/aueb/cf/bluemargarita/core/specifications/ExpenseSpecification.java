package gr.aueb.cf.bluemargarita.core.specifications;

import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;
import gr.aueb.cf.bluemargarita.model.Expense;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class ExpenseSpecification {

    private  ExpenseSpecification(){
    }

    public static Specification<Expense> hasDescription(String description) {
        return (root, query, criteriaBuilder) -> {
            if(description == null || description.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            return criteriaBuilder.like(criteriaBuilder.lower(root.get("description")),
                    "%" + description.toLowerCase().trim() + "%");
        };
    }

    public static Specification<Expense> hasExpenseDateBetween(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate == null && endDate == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            if (startDate == null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("expenseDate"), endDate);
            }
            if (endDate == null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("expenseDate"), startDate);
            }
            return criteriaBuilder.between(root.get("expenseDate"), startDate, endDate);
        };
    }

    public static Specification<Expense> hasExpenseType(String expenseType) {
        return (root, query, criteriaBuilder) -> {
            if(expenseType == null || expenseType.trim().isEmpty()) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }

            ExpenseType type = ExpenseType.valueOf(expenseType.toUpperCase());

            return criteriaBuilder.equal(root.get("expenseType"), type);
        };
    }

    public static Specification<Expense> isPurchaseExpense(Boolean isPurchase) {
        return (root, query, criteriaBuilder) -> {
            if(isPurchase == null) {
                return criteriaBuilder.isTrue(criteriaBuilder.literal(true));
            }
            if (isPurchase) {
                return criteriaBuilder.isNotNull(root.get("purchase"));
            } else {
                return criteriaBuilder.isNull(root.get("purchase"));
            }

        };
    }

}
