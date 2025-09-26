package br.com.comercialpereira.repository;

import br.com.comercialpereira.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByCode(String code);

    Optional<Product> findByBarcode(String barcode);

    boolean existsByCode(String code);

    boolean existsByBarcode(String barcode);

    boolean existsByCodeAndIdNot(String code, Long id);

    List<Product> findByCategoryIdAndIsActive(Long categoryId, Boolean isActive);

    List<Product> findBySupplierIdAndIsActive(Long supplierId, Boolean isActive);

    @Query("SELECT p FROM Product p JOIN p.inventory i WHERE i.quantity <= i.minStock AND p.isActive = true")
    List<Product> findProductsWithLowStock();

    @Query("SELECT p FROM Product p JOIN p.inventory i WHERE i.quantity = 0 AND p.isActive = true")
    List<Product> findProductsOutOfStock();

    @Query("SELECT p FROM Product p WHERE " +
            "(:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:supplierId IS NULL OR p.supplier.id = :supplierId) AND " +
            "(:isActive IS NULL OR p.isActive = :isActive) AND " +
            "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> findByFilters(@Param("search") String search,
                                @Param("categoryId") Long categoryId,
                                @Param("supplierId") Long supplierId,
                                @Param("isActive") Boolean isActive,
                                @Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice,
                                Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.code) LIKE LOWER(CONCAT('%', :query, '%')) AND p.isActive = true")
    List<Product> findByNameOrCodeContainingIgnoreCase(@Param("query") String query, Pageable pageable);

    @Query("SELECT p, SUM(si.quantity) as totalSold FROM Product p " +
            "LEFT JOIN p.saleItems si LEFT JOIN si.sale s " +
            "WHERE s.status = 'COMPLETED' " +
            "GROUP BY p.id ORDER BY totalSold DESC NULLS LAST")
    List<Object[]> findTopSellingProducts(Pageable pageable);

    @Query("SELECT AVG(p.price) FROM Product p WHERE p.isActive = true")
    BigDecimal findAveragePrice();

    @Query("SELECT SUM(p.price * i.quantity) FROM Product p JOIN p.inventory i WHERE p.isActive = true")
    BigDecimal calculateTotalInventoryValue();
}