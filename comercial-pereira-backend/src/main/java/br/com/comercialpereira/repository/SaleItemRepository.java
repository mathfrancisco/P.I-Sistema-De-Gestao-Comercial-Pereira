package br.com.comercialpereira.repository;

import br.com.comercialpereira.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findBySaleId(Long saleId);

    List<SaleItem> findByProductId(Long productId);

    @Query("SELECT si.product.id, si.product.name, SUM(si.quantity), SUM(si.total) FROM SaleItem si " +
            "JOIN si.sale s WHERE s.status = 'COMPLETED' AND s.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY si.product.id, si.product.name ORDER BY SUM(si.quantity) DESC")
    List<Object[]> getTopSellingProducts(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);

    @Query("SELECT si.product.category.id, si.product.category.name, SUM(si.quantity), SUM(si.total) FROM SaleItem si " +
            "JOIN si.sale s WHERE s.status = 'COMPLETED' AND s.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY si.product.category.id, si.product.category.name ORDER BY SUM(si.total) DESC")
    List<Object[]> getSalesByCategory(@Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(si.quantity) FROM SaleItem si JOIN si.sale s WHERE s.status = 'COMPLETED'")
    Long getTotalQuantitySold();
}