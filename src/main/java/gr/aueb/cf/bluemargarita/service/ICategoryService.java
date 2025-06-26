package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.category.CategoryInsertDTO;
import gr.aueb.cf.bluemargarita.dto.category.CategoryReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.category.CategoryUpdateDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ICategoryService {
    CategoryReadOnlyDTO createCategory(CategoryInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    CategoryReadOnlyDTO updateCategory(CategoryUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException;
    void deleteCategory(Long id) throws EntityNotFoundException;
    CategoryReadOnlyDTO getCategoryById(Long id) throws EntityNotFoundException;
    List<CategoryReadOnlyDTO> getAllCategories();
    Page<CategoryReadOnlyDTO> getAllCategoriesPaginated(int page,
                                                        int size);
    boolean nameExists(String name);

}
