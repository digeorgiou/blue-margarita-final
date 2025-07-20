package gr.aueb.cf.bluemargarita.model;

import com.fasterxml.jackson.databind.util.BeanUtil;
import gr.aueb.cf.bluemargarita.core.enums.ExpenseType;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.repository.JpaContext;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "expenses")
public class Expense extends AbstractEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String description;

    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_type", nullable = false)
    private ExpenseType expenseType;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "purchase_id")
    private Purchase purchase;


    // Helper methods
    public void linkToPurchase(Purchase purchase) {
        this.purchase = purchase;
        if (purchase != null) {
            purchase.setRelatedExpense(this);
        }
    }

    public void unlinkFromPurchase() {
        if (this.purchase != null) {
            this.purchase.setRelatedExpense(null);
            this.purchase = null;
        }
    }
}
