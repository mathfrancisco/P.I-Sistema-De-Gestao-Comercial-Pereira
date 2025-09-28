package br.com.comercialpereira.repository;

import br.com.comercialpereira.entity.Inventory;
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
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    @Query("SELECT i FROM Inventory i WHERE i.quantity <= i.minStock")
    List<Inventory> findLowStockItems();

    @Query("SELECT i FROM Inventory i WHERE i.quantity = 0")
    List<Inventory> findOutOfStockItems();

    @Query("SELECT i FROM Inventory i WHERE i.maxStock IS NOT NULL AND i.quantity > i.maxStock")
    List<Inventory> findOverstockItems();

    @Query("SELECT i FROM Inventory i JOIN i.product p WHERE " +
            "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
            "(:supplierId IS NULL OR p.supplier.id = :supplierId) AND " +
            "(:lowStock IS NULL OR (:lowStock = true AND i.quantity <= i.minStock) OR (:lowStock = false AND i.quantity > i.minStock)) AND " +
            "(:outOfStock IS NULL OR (:outOfStock = true AND i.quantity = 0) OR (:outOfStock = false AND i.quantity > 0))")
    Page<Inventory> findByFilters(@Param("categoryId") Long categoryId,
                                  @Param("supplierId") Long supplierId,
                                  @Param("lowStock") Boolean lowStock,
                                  @Param("outOfStock") Boolean outOfStock,
                                  Pageable pageable);

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity <= i.minStock")
    long countLowStockItems();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.quantity = 0")
    long countOutOfStockItems();

    @Query("SELECT SUM(i.quantity) FROM Inventory i")
    Long getTotalQuantity();

    @Query("SELECT i.location, COUNT(i) FROM Inventory i WHERE i.location IS NOT NULL GROUP BY i.location")
    List<Object[]> countByLocation();

    @Query("SELECT i FROM Inventory i WHERE i.lastUpdate < :dateTime")
    List<Inventory> findItemsNotUpdatedSince(@Param("dateTime") LocalDateTime dateTime);
}