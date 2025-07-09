package gr.aueb.cf.bluemargarita.service;

import gr.aueb.cf.bluemargarita.core.exceptions.EntityAlreadyExistsException;
import gr.aueb.cf.bluemargarita.core.exceptions.EntityNotFoundException;
import gr.aueb.cf.bluemargarita.core.filters.Paginated;
import gr.aueb.cf.bluemargarita.core.filters.SupplierFilters;
import gr.aueb.cf.bluemargarita.core.specifications.SupplierSpecification;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierInsertDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierReadOnlyDTO;
import gr.aueb.cf.bluemargarita.dto.supplier.SupplierUpdateDTO;
import gr.aueb.cf.bluemargarita.mapper.Mapper;
import gr.aueb.cf.bluemargarita.model.Supplier;
import gr.aueb.cf.bluemargarita.model.User;
import gr.aueb.cf.bluemargarita.repository.SupplierRepository;
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
public class SupplierService implements ISupplierService {

    private static final Logger LOGGER = LoggerFactory.getLogger(SupplierService.class);
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final Mapper mapper;

    @Autowired
    public SupplierService(SupplierRepository supplierRepository, UserRepository userRepository, Mapper mapper) {
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SupplierReadOnlyDTO createSupplier(SupplierInsertDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        if (dto.tin() != null && supplierRepository.existsByTin(dto.tin())) {
            throw new EntityAlreadyExistsException("Supplier", "Supplier with TIN " + dto.tin() + " already exists");
        }

        if (dto.email() != null && supplierRepository.existsByEmail(dto.email())) {
            throw new EntityAlreadyExistsException("Supplier", "Supplier with email " + dto.email() + " already exists");
        }

        Supplier supplier = mapper.mapSupplierInsertToModel(dto);

        User creator = userRepository.findById(dto.creatorUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "User with id " + dto.creatorUserId() + " not found"));

        supplier.setCreatedBy(creator);
        supplier.setLastUpdatedBy(creator);

        Supplier insertedSupplier = supplierRepository.save(supplier);

        LOGGER.info("Supplier created with id: {}", insertedSupplier.getId());

        return mapper.mapToSupplierReadOnlyDTO(insertedSupplier);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SupplierReadOnlyDTO updateSupplier(SupplierUpdateDTO dto) throws EntityAlreadyExistsException, EntityNotFoundException {

        Supplier existingSupplier = supplierRepository.findById(dto.supplierId())
                .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id=" + dto.supplierId() + " was not found"));

        if (dto.tin() != null && !dto.tin().equals(existingSupplier.getTin()) && supplierRepository.existsByTin(dto.tin())) {
            throw new EntityAlreadyExistsException("Supplier", "Supplier with TIN " + dto.tin() + " already exists");
        }

        if (dto.email() != null && !dto.email().equals(existingSupplier.getEmail()) && supplierRepository.existsByEmail(dto.email())) {
            throw new EntityAlreadyExistsException("Supplier", "Supplier with email " + dto.email() + " already exists");
        }

        User updater = userRepository.findById(dto.updaterUserId())
                .orElseThrow(() -> new EntityNotFoundException("User", "Updater user with id=" + dto.updaterUserId() + " was not found"));

        Supplier updatedSupplier = mapper.mapSupplierUpdateToModel(dto, existingSupplier);
        updatedSupplier.setLastUpdatedBy(updater);

        Supplier savedSupplier = supplierRepository.save(updatedSupplier);

        LOGGER.info("Supplier {} updated by user {}", savedSupplier.getName(), updater.getUsername());

        return mapper.mapToSupplierReadOnlyDTO(savedSupplier);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteSupplier(Long id) throws EntityNotFoundException {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id=" + id + " was not found"));

        if (!supplier.getAllPurchases().isEmpty()) {
            // Soft Delete if supplier is used in any purchases
            supplier.setIsActive(false);
            supplier.setDeletedAt(LocalDateTime.now());
            supplierRepository.save(supplier);

            LOGGER.info("Supplier {} soft deleted. Used in {} purchases", supplier.getName(), supplier.getAllPurchases().size());
        } else {
            // Hard delete if supplier not used anywhere
            supplierRepository.delete(supplier);
            LOGGER.info("Supplier {} hard deleted (not used in any purchases)", supplier.getName());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierReadOnlyDTO getSupplierById(Long id) throws EntityNotFoundException {

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier", "Supplier with id=" + id + " was not found"));

        return mapper.mapToSupplierReadOnlyDTO(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierReadOnlyDTO> getFilteredSuppliers(SupplierFilters filters) {
        return supplierRepository.findAll(getSpecsFromFilters(filters))
                .stream()
                .map(mapper::mapToSupplierReadOnlyDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Paginated<SupplierReadOnlyDTO> getSuppliersFilteredPaginated(SupplierFilters filters) {
        var filtered = supplierRepository.findAll(
                getSpecsFromFilters(filters),
                filters.getPageable()
        );
        return new Paginated<>(filtered.map(mapper::mapToSupplierReadOnlyDTO));
    }

    private Specification<Supplier> getSpecsFromFilters(SupplierFilters filters) {
        return Specification
                .where(SupplierSpecification.supplierNameLike(filters.getName()))
                .and(SupplierSpecification.supplierEmailLike(filters.getEmail()))
                .and(SupplierSpecification.supplierTinLike(filters.getTin()))
                .and(SupplierSpecification.supplierPhoneNumberLike(filters.getPhoneNumber()))
                .and(SupplierSpecification.supplierAddressLike(filters.getAddress()))
                .and(SupplierSpecification.supplierIsActive(filters.getIsActive()));
    }

}
