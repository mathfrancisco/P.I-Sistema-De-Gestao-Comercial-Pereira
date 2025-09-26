package br.com.comercialpereira.services;

import br.com.comercialpereira.dto.supplier.*;
import br.com.comercialpereira.entity.Supplier;
import br.com.comercialpereira.exception.ApiException;
import br.com.comercialpereira.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional
    public SupplierResponse create(CreateSupplierRequest request) {
        log.info("Creating supplier: {}", request.getName());

        // Validar campos obrigatórios
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ApiException("Nome do fornecedor é obrigatório", HttpStatus.BAD_REQUEST);
        }

        // Validar CNPJ único se informado
        if (request.getCnpj() != null && !request.getCnpj().isEmpty()) {
            String formattedCnpj = formatCNPJ(request.getCnpj());
            if (formattedCnpj != null && supplierRepository.existsByCnpj(formattedCnpj)) {
                throw new ApiException("CNPJ já está em uso", HttpStatus.CONFLICT);
            }
        }

        // Criar fornecedor
        Supplier supplier = Supplier.builder()
                .name(request.getName().trim())
                .contactPerson(request.getContactPerson() != null ? request.getContactPerson().trim() : null)
                .email(request.getEmail() != null ? request.getEmail().toLowerCase().trim() : null)
                .phone(formatPhone(request.getPhone()))
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .city(request.getCity() != null ? request.getCity().trim() : null)
                .state(request.getState() != null ? request.getState().toUpperCase() : null)
                .zipCode(formatCEP(request.getZipCode()))
                .cnpj(formatCNPJ(request.getCnpj()))
                .website(request.getWebsite() != null ? request.getWebsite().trim() : null)
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        Supplier savedSupplier = supplierRepository.save(supplier);

        log.info("Supplier created successfully with ID: {}", savedSupplier.getId());
        return convertToSupplierResponse(savedSupplier);
    }

    @Transactional(readOnly = true)
    public Page<SupplierResponse> findByFilters(SupplierFilters filters) {
        log.debug("Finding suppliers with filters: {}", filters);

        Pageable pageable = PageRequest.of(
                filters.getPage(),
                filters.getSize(),
                buildSort(filters.getSortBy(), filters.getSortOrder())
        );

        Page<Supplier> suppliers = supplierRepository.findByFilters(
                filters.getSearch(),
                filters.getIsActive(),
                filters.getState(),
                filters.getHasEmail(),
                filters.getHasCnpj(),
                pageable
        );

        return suppliers.map(this::convertToSupplierResponse);
    }

    @Transactional(readOnly = true)
    public SupplierResponse findById(Long id) {
        log.debug("Finding supplier by ID: {}", id);

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ApiException("Fornecedor não encontrado", HttpStatus.NOT_FOUND));

        return convertToSupplierResponse(supplier);
    }

    @Transactional(readOnly = true)
    public SupplierResponse findByCnpj(String cnpj) {
        log.debug("Finding supplier by CNPJ: {}", cnpj);

        String formattedCnpj = formatCNPJ(cnpj);
        if (formattedCnpj == null) {
            throw new ApiException("CNPJ inválido", HttpStatus.BAD_REQUEST);
        }

        Supplier supplier = supplierRepository.findByCnpj(formattedCnpj)
                .orElseThrow(() -> new ApiException("Fornecedor não encontrado", HttpStatus.NOT_FOUND));

        return convertToSupplierResponse(supplier);
    }

    @Transactional
    public SupplierResponse update(Long id, UpdateSupplierRequest request) {
        log.info("Updating supplier with ID: {}", id);

        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ApiException("Fornecedor não encontrado", HttpStatus.NOT_FOUND));

        // Validar CNPJ único se alterando
        if (request.getCnpj() != null && !request.getCnpj().equals(existingSupplier.getCnpj())) {
            String formattedCnpj = formatCNPJ(request.getCnpj());
            if (formattedCnpj != null && supplierRepository.existsByCnpj(formattedCnpj)) {
                throw new ApiException("CNPJ já está em uso", HttpStatus.CONFLICT);
            }
            existingSupplier.setCnpj(formattedCnpj);
        }

        // Atualizar campos
        if (request.getName() != null) {
            existingSupplier.setName(request.getName().trim());
        }
        if (request.getContactPerson() != null) {
            existingSupplier.setContactPerson(request.getContactPerson().trim());
        }
        if (request.getEmail() != null) {
            existingSupplier.setEmail(request.getEmail().toLowerCase().trim());
        }
        if (request.getPhone() != null) {
            existingSupplier.setPhone(formatPhone(request.getPhone()));
        }
        if (request.getAddress() != null) {
            existingSupplier.setAddress(request.getAddress().trim());
        }
        if (request.getCity() != null) {
            existingSupplier.setCity(request.getCity().trim());
        }
        if (request.getState() != null) {
            existingSupplier.setState(request.getState().toUpperCase());
        }
        if (request.getZipCode() != null) {
            existingSupplier.setZipCode(formatCEP(request.getZipCode()));
        }
        if (request.getWebsite() != null) {
            existingSupplier.setWebsite(request.getWebsite().trim());
        }
        if (request.getNotes() != null) {
            existingSupplier.setNotes(request.getNotes().trim());
        }
        if (request.getIsActive() != null) {
            existingSupplier.setIsActive(request.getIsActive());
        }

        Supplier updatedSupplier = supplierRepository.save(existingSupplier);

        log.info("Supplier updated successfully with ID: {}", updatedSupplier.getId());
        return convertToSupplierResponse(updatedSupplier);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting supplier with ID: {}", id);

        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ApiException("Fornecedor não encontrado", HttpStatus.NOT_FOUND));

        // Verificar se tem produtos associados
        if (supplier.getProducts() != null && !supplier.getProducts().isEmpty()) {
            throw new ApiException("Não é possível excluir fornecedor que possui produtos cadastrados", HttpStatus.BAD_REQUEST);
        }

        // Soft delete
        supplier.setIsActive(false);
        supplierRepository.save(supplier);

        log.info("Supplier soft deleted successfully with ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> search(String query, Integer limit, Boolean includeInactive) {
        log.debug("Searching suppliers with query: {}", query);

        List<Supplier> suppliers = supplierRepository.findAll().stream()
                .filter(supplier -> includeInactive || supplier.getIsActive())
                .filter(supplier ->
                        supplier.getName().toLowerCase().contains(query.toLowerCase()) ||
                                (supplier.getContactPerson() != null && supplier.getContactPerson().toLowerCase().contains(query.toLowerCase())) ||
                                (supplier.getEmail() != null && supplier.getEmail().toLowerCase().contains(query.toLowerCase())) ||
                                (supplier.getCity() != null && supplier.getCity().toLowerCase().contains(query.toLowerCase()))
                )
                .limit(limit != null ? limit : 20)
                .toList();

        return suppliers.stream()
                .map(this::convertToSupplierResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getActiveSuppliers() {
        log.debug("Getting all active suppliers");

        List<Supplier> suppliers = supplierRepository.findByIsActiveOrderByName(true);

        return suppliers.stream()
                .map(this::convertToSupplierResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getSuppliersByState(String state) {
        log.debug("Getting suppliers by state: {}", state);

        List<Supplier> suppliers = supplierRepository.findByStateAndIsActive(state.toUpperCase(), true);

        return suppliers.stream()
                .map(this::convertToSupplierResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getSuppliersWithProducts() {
        log.debug("Getting suppliers with products");

        List<Supplier> suppliers = supplierRepository.findSuppliersWithProducts();

        return suppliers.stream()
                .map(this::convertToSupplierResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        log.debug("Getting supplier statistics");

        long totalSuppliers = supplierRepository.count();
        long activeSuppliers = supplierRepository.findByIsActiveOrderByName(true).size();
        long inactiveSuppliers = totalSuppliers - activeSuppliers;

        List<Object[]> countByState = supplierRepository.countByState();
        Map<String, Long> stateDistribution = countByState.stream()
                .collect(Collectors.toMap(
                        record -> record[0] != null ? record[0].toString() : "N/A",
                        record -> (Long) record[1]
                ));

        List<Supplier> suppliersWithProducts = supplierRepository.findSuppliersWithProducts();
        long suppliersWithProductsCount = suppliersWithProducts.size();
        long suppliersWithoutProductsCount = activeSuppliers - suppliersWithProductsCount;

        return Map.of(
                "total", totalSuppliers,
                "active", activeSuppliers,
                "inactive", inactiveSuppliers,
                "withProducts", suppliersWithProductsCount,
                "withoutProducts", suppliersWithoutProductsCount,
                "byState", stateDistribution
        );
    }

    private SupplierResponse convertToSupplierResponse(Supplier supplier) {
        return SupplierResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .email(supplier.getEmail())
                .phone(supplier.getPhone())
                .address(supplier.getAddress())
                .city(supplier.getCity())
                .state(supplier.getState())
                .zipCode(supplier.getZipCode())
                .cnpj(supplier.getCnpj())
                .website(supplier.getWebsite())
                .notes(supplier.getNotes())
                .isActive(supplier.getIsActive())
                .createdAt(supplier.getCreatedAt())
                .updatedAt(supplier.getUpdatedAt())
                .productCount(supplier.getProducts() != null ? supplier.getProducts().size() : 0)
                .build();
    }

    private Sort buildSort(String sortBy, String sortOrder) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;

        switch (sortBy) {
            case "name":
                return Sort.by(direction, "name");
            case "contactPerson":
                return Sort.by(direction, "contactPerson");
            case "city":
                return Sort.by(direction, "city");
            case "state":
                return Sort.by(direction, "state");
            case "createdAt":
                return Sort.by(direction, "createdAt");
            case "updatedAt":
                return Sort.by(direction, "updatedAt");
            default:
                return Sort.by(Sort.Direction.ASC, "name");
        }
    }

    // Métodos de formatação
    private String formatCNPJ(String cnpj) {
        if (cnpj == null || cnpj.trim().isEmpty()) {
            return null;
        }

        String numbers = cnpj.replaceAll("[^\\d]", "");

        if (numbers.length() == 14) {
            return String.format("%s.%s.%s/%s-%s",
                    numbers.substring(0, 2),
                    numbers.substring(2, 5),
                    numbers.substring(5, 8),
                    numbers.substring(8, 12),
                    numbers.substring(12, 14));
        }

        return cnpj;
    }

    private String formatPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }

        String numbers = phone.replaceAll("[^\\d]", "");

        if (numbers.length() == 10) {
            return String.format("(%s) %s-%s",
                    numbers.substring(0, 2),
                    numbers.substring(2, 6),
                    numbers.substring(6, 10));
        } else if (numbers.length() == 11) {
            return String.format("(%s) %s-%s",
                    numbers.substring(0, 2),
                    numbers.substring(2, 7),
                    numbers.substring(7, 11));
        }

        return phone;
    }

    private String formatCEP(String cep) {
        if (cep == null || cep.trim().isEmpty()) {
            return null;
        }

        String numbers = cep.replaceAll("[^\\d]", "");

        if (numbers.length() == 8) {
            return String.format("%s-%s",
                    numbers.substring(0, 5),
                    numbers.substring(5, 8));
        }

        return cep;
    }
}