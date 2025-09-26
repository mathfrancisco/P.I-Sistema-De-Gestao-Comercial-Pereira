package br.com.comercialpereira.repository;

import br.com.comercialpereira.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByCnpj(String cnpj);

    boolean existsByCnpj(String cnpj);

    List<Supplier> findByIsActiveOrderByName(Boolean isActive);

    List<Supplier> findByStateAndIsActive(String state, Boolean isActive);

    @Query("SELECT s FROM Supplier s WHERE " +
            "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:isActive IS NULL OR s.isActive = :isActive) AND " +
            "(:state IS NULL OR s.state = :state) AND " +
            "(:hasEmail IS NULL OR (:hasEmail = true AND s.email IS NOT NULL) OR (:hasEmail = false AND s.email IS NULL)) AND " +
            "(:hasCnpj IS NULL OR (:hasCnpj = true AND s.cnpj IS NOT NULL) OR (:hasCnpj = false AND s.cnpj IS NULL))")
    Page<Supplier> findByFilters(@Param("search") String search,
                                 @Param("isActive") Boolean isActive,
                                 @Param("state") String state,
                                 @Param("hasEmail") Boolean hasEmail,
                                 @Param("hasCnpj") Boolean hasCnpj,
                                 Pageable pageable);

    @Query("SELECT s.state, COUNT(s) FROM Supplier s WHERE s.isActive = true GROUP BY s.state")
    List<Object[]> countByState();

    @Query("SELECT s FROM Supplier s WHERE s.isActive = true AND SIZE(s.products) > 0")
    List<Supplier> findSuppliersWithProducts();
}