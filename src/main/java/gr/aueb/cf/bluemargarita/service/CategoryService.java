package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.dto.category.CategoryInsertDTO;
import gr.aueb.cf.bluemargarita.dto.category.CategoryReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.category.CategoryUpdateDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Category;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.CategoryRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService implements ICategoryService{

    private static final Logger LOGGER =
            LoggerFactory.getLogger(CategoryService.class);
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;

    @Autowired
    public CategoryService(CategoryRepository categoryRepository, UserRepository userRepository, Mapper mapper) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryReadOnlyDTO createCategory(CategoryInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        if (categoryRepository.existsByName(dto.name())) {
            throw new EntityAlreadyExistsException("Category", "Category with" +
                    " name " + dto.name() + " already exists");
        }

        Category category = mapper.mapCategoryInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User " +
                        "with id " + dto.creatorUserId() + " not found"));

        category.setCreatedBy(creator);
        category.setLastUpdatedBy(creator);

        Category insertedCategory = categoryRepository.save(category);

        LOGGER.info("Category created with id: {}", insertedCategory.getId());

        return mapper.mapToCategoryReadOnlyDTO(insertedCategory);

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CategoryReadOnlyDTO updateCategory(CategoryUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Category existingCategory = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category",
                        "Category with id=" + dto.categoryId() + " was not " +
                                "found"));

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User",
                        "Updater user with id=" + dto.categoryId() + " was " +
                                "not found"));

        Category updatedCategory = mapper.mapCategoryUpdateToModel(dto,
                existingCategory);
        updatedCategory.setLastUpdatedBy(updater);

        Category savedCategory = categoryRepository.save(updatedCategory);

        LOGGER.info("Category {} updated by user {}", savedCategory.getName() ,
                updater.getUsername());

        return mapper.mapToCategoryReadOnlyDTO(savedCategory);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteCategory(Long id) throws EntityNotFoundException {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category",
                        "Category with id=" + id + " was not found"));

        if(!category.getAllProducts().isEmpty()){
            //Soft Delete if category is used in any products
            category.setIsActive(false);
            category.setDeletedAt(LocalDateTime.now());
            categoryRepository.save(category);

            LOGGER.info("Category {} soft deleted. Used in {} products",
                    category.getName(), category.getAllProducts().size());
        } else {
            //Hard delete if category not used anywhere
            categoryRepository.delete(category);
            LOGGER.info("Category {} hard deleted (not used in any products)",
                    category.getName());
        }

    }

    @Override
    @Transactional(readOnly = true)
    public CategoryReadOnlyDTO getCategoryById(Long id) throws EntityNotFoundException{

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Category",
                        "Category with id=" + id + " was not found"));

        return mapper.mapToCategoryReadOnlyDTO(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryReadOnlyDTO> getAllCategories() {

        List<Category> categories = categoryRepository.findAll();

        return categories.stream()
                .map(mapper::mapToCategoryReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryReadOnlyDTO> getAllCategoriesPaginated(int page,
                                                             int size){

        Pageable pageable = PageRequest.of(page, size);
        Page<Category> categoryPage = categoryRepository.findAll(pageable);
        return categoryPage.map(mapper::mapToCategoryReadOnlyDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean nameExists(String name) {
        return categoryRepository.existsByName(name);
    }

}
