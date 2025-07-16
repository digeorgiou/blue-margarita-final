package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.ToDoTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ToDoTaskRepository extends JpaRepository<ToDoTask, Long>,
        JpaSpecificationExecutor<ToDoTask>{

    @Query("SELECT t FROM ToDoTask t WHERE " +
            "(t.date <= :today AND t.status = 'PENDING') " +
            "ORDER BY t.date ASC, t.id ASC")
    List<ToDoTask> findTodayAndOverdueTasks(@Param("today") LocalDate today,
                                            org.springframework.data.domain.Pageable pageable);


    @Query("SELECT t FROM ToDoTask t WHERE " +
            "t.date > :today AND t.date <= :endOfWeek AND t.status = 'PENDING' " +
            "ORDER BY t.date ASC, t.id ASC")
    List<ToDoTask> findThisWeekTasks(@Param("today") LocalDate today,
                                     @Param("endOfWeek") LocalDate endOfWeek,
                                     org.springframework.data.domain.Pageable pageable);

    @Query("SELECT COUNT(t) FROM ToDoTask t WHERE " +
            "t.date < :today AND t.status = 'PENDING'")
    Long countOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT COUNT(t) FROM ToDoTask t WHERE " +
            "t.date = :today AND t.status = 'PENDING'")
    Long countTodayTasks(@Param("today") LocalDate today);


    @Query("SELECT COUNT(t) FROM ToDoTask t WHERE " +
            "t.date > :today AND t.date <= :endOfWeek AND t.status = 'PENDING'")
    Long countThisWeekTasks(@Param("today") LocalDate today,
                            @Param("endOfWeek") LocalDate endOfWeek);

    @Query("SELECT COUNT(t) FROM ToDoTask t WHERE t.status = 'PENDING'")
    Long countAllPendingTasks();

}
