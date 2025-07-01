package gr.aueb.cf.bluemargarita.model;

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
    Long id;

    @Column(nullable = false)
    String description;

    LocalDate date;

    boolean completed;

    LocalDate dateCompleted;


}
