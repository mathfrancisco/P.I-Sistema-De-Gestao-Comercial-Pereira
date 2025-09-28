package br.com.comercialpereira.repository;

import br.com.comercialpereira.entity.Customer;
import br.com.comercialpereira.enums.CustomerType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByDocument(String document);

    Optional<Customer> findByEmail(String email);

    boolean existsByDocument(String document);

    boolean existsByEmail(String email);

    List<Customer> findByTypeAndIsActive(CustomerType type, Boolean isActive);

    List<Customer> findByStateAndIsActive(String state, Boolean isActive);

    // Query corrigida usando SQL nativo para evitar problemas de conversão de tipos
    @Query(value = """
        SELECT * FROM customers c 
        WHERE (:search IS NULL 
               OR LOWER(CAST(c.name AS VARCHAR)) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%'))
               OR LOWER(CAST(c.email AS VARCHAR)) LIKE LOWER(CONCAT('%', CAST(:search AS VARCHAR), '%')))
        AND (:type IS NULL OR c.type = CAST(:type AS VARCHAR))
        AND (:city IS NULL OR LOWER(CAST(c.city AS VARCHAR)) LIKE LOWER(CONCAT('%', CAST(:city AS VARCHAR), '%')))
        AND (:state IS NULL OR c.state = :state)
        AND (:isActive IS NULL OR c.is_active = :isActive)
        ORDER BY c.name
        """, nativeQuery = true)
    Page<Customer> findByFilters(@Param("search") String search,
                                 @Param("type") String type,
                                 @Param("city") String city,
                                 @Param("state") String state,
                                 @Param("isActive") Boolean isActive,
                                 Pageable pageable);

    @Query("SELECT c FROM Customer c JOIN c.sales s WHERE s.createdAt >= :dateFrom " +
            "GROUP BY c.id HAVING COUNT(s) > 0 ORDER BY COUNT(s) DESC")
    List<Customer> findCustomersWithRecentPurchases(@Param("dateFrom") LocalDateTime dateFrom);

    @Query("SELECT c.state, COUNT(c) FROM Customer c WHERE c.isActive = true GROUP BY c.state")
    List<Object[]> countByState();

    @Query("SELECT COUNT(c) FROM Customer c WHERE c.type = :type")
    long countByType(@Param("type") CustomerType type);
}