package br.com.comercialpereira.repository;

import br.com.comercialpereira.entity.InventoryMovement;
import br.com.comercialpereira.enums.MovementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {

    List<InventoryMovement> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<InventoryMovement> findByTypeAndCreatedAtBetween(MovementType type, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT im FROM InventoryMovement im WHERE " +
            "(:productId IS NULL OR im.product.id = :productId) AND " +
            "(:type IS NULL OR im.type = :type) AND " +
            "(:userId IS NULL OR im.user.id = :userId) AND " +
            "(:saleId IS NULL OR im.sale.id = :saleId) AND " +
            "(:dateFrom IS NULL OR im.createdAt >= :dateFrom) AND " +
            "(:dateTo IS NULL OR im.createdAt <= :dateTo)")
    Page<InventoryMovement> findByFilters(@Param("productId") Long productId,
                                          @Param("type") MovementType type,
                                          @Param("userId") Long userId,
                                          @Param("saleId") Long saleId,
                                          @Param("dateFrom") LocalDateTime dateFrom,
                                          @Param("dateTo") LocalDateTime dateTo,
                                          Pageable pageable);

    @Query("SELECT COUNT(im) FROM InventoryMovement im WHERE im.type = :type")
    long countByType(@Param("type") MovementType type);

    @Query("SELECT im FROM InventoryMovement im ORDER BY im.createdAt DESC")
    List<InventoryMovement> findRecentMovements(Pageable pageable);

    @Query("SELECT DATE(im.createdAt), im.type, COUNT(im), SUM(im.quantity) FROM InventoryMovement im " +
            "WHERE im.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(im.createdAt), im.type ORDER BY DATE(im.createdAt)")
    List<Object[]> getMovementsByDateAndType(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}