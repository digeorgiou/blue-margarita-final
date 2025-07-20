package gr.aueb.cf.bluemargarita.repository;

import gr.aueb.cf.bluemargarita.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>,
        JpaSpecificationExecutor<Category> {
    boolean existsByName(String name);
    List<Category> findByIsActiveTrue();

    @Query("SELECT c.name FROM Category c WHERE c.id = :categoryId")
    String findCategoryNameById(@Param("categoryId") Long categoryId);

}
