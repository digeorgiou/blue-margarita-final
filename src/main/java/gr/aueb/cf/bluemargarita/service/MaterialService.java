package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.MaterialFilters;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.specifications.MaterialSpecification;
import gr.aueb.cf.bluemargarita.dto.material.MaterialInsertDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.material.MaterialUpdateDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Material;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.MaterialRepository;
import gr.aueb.cf.bluemargarita.repository.UserRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaterialService implements IMaterialService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MaterialService.class);
    private final MaterialRepository materialRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;

    @Autowired
    public MaterialService(MaterialRepository materialRepository, UserRepository userRepository, Mapper mapper) {
        this.materialRepository = materialRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialReadOnlyDTO createMaterial(MaterialInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        if (materialRepository.existsByDescription(dto.name())) {
            throw new EntityAlreadyExistsException("Material", "Material with description " + dto.name() + " already exists");
        }

        Material material = mapper.mapMaterialInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.creatorUserId() + " not found"));

        material.setCreatedBy(creator);
        material.setLastUpdatedBy(creator);

        Material insertedMaterial = materialRepository.save(material);

        LOGGER.info("Material created with id: {}", insertedMaterial.getId());

        return mapper.mapToMaterialReadOnlyDTO(insertedMaterial);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MaterialReadOnlyDTO updateMaterial(MaterialUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Material existingMaterial = materialRepository.findById(dto.materialId())
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + dto.materialId() + " was not found"));

        if (!existingMaterial.getName().equals(dto.name()) && materialRepository.existsByDescription(dto.name())) {
            throw new EntityAlreadyExistsException("Material", "Material with description " + dto.name() + " already exists");
        }

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "Updater user with id=" + dto.updaterUserId() + " was not found"));

        Material updatedMaterial = mapper.mapMaterialUpdateToModel(dto, existingMaterial);
        updatedMaterial.setLastUpdatedBy(updater);

        Material savedMaterial = materialRepository.save(updatedMaterial);

        LOGGER.info("Material {} updated by user {}", savedMaterial.getName(), updater.getUsername());

        return mapper.mapToMaterialReadOnlyDTO(savedMaterial);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMaterial(Long id) throws EntityNotFoundException {

        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + id + " was not found"));

        if (!material.getAllPurchaseMaterials().isEmpty() || !material.getAllProductMaterials().isEmpty()) {
            // Soft Delete if material is used in any purchases or products
            material.setIsActive(false);
            material.setDeletedAt(LocalDateTime.now());
            materialRepository.save(material);

            LOGGER.info("Material {} soft deleted. Used in {} purchases and {} products",
                    material.getName(),
                    material.getAllPurchaseMaterials().size(),
                    material.getAllProductMaterials().size());
        } else {
            // Hard delete if material not used anywhere
            materialRepository.delete(material);
            LOGGER.info("Material {} hard deleted (not used in any purchases or products)", material.getName());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MaterialReadOnlyDTO getMaterialById(Long id) throws EntityNotFoundException {

        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Material", "Material with id=" + id + " was not found"));

        return mapper.mapToMaterialReadOnlyDTO(material);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MaterialReadOnlyDTO> getFilteredMaterials(MaterialFilters filters) {
        return materialRepository.findAll(getSpecsFromFilters(filters))
                .stream()
                .map(mapper::mapToMaterialReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<MaterialReadOnlyDTO> getMaterialsFilteredPaginated(MaterialFilters filters) {
        var filtered = materialRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToMaterialReadOnlyDTO));
    }

    private Specification<Material> getSpecsFromFilters(MaterialFilters filters) {
        return Specification
                .where(MaterialSpecification.materialNameLike(filters.getName()))
                .and(MaterialSpecification.materialIsActive(filters.getIsActive()));
    }

}

