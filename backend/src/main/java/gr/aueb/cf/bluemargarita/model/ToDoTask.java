package gr.aueb.cf.bluemargarita.model;

import gr.aueb.cf.bluemargarita.core.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "to_do_task")
public class ToDoTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String description;

    @Column(name = "task_date")
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TaskStatus status = TaskStatus.PENDING;

    @Column(name = "date_completed")
    private LocalDate dateCompleted;

    // Helper methods for convenience
    public boolean isCompleted() {
        return status == TaskStatus.COMPLETED;
    }

    public boolean isPending() {
        return status == TaskStatus.PENDING;
    }

    public boolean isCancelled() {
        return status == TaskStatus.CANCELLED;
    }

    public void markAsCompleted() {
        this.status = TaskStatus.COMPLETED;
        this.dateCompleted = LocalDate.now();
    }

    public void markAsPending() {
        this.status = TaskStatus.PENDING;
        this.dateCompleted = null;
    }

    public void markAsCancelled() {
        this.status = TaskStatus.CANCELLED;
        this.dateCompleted = LocalDate.now();
    }
}