package br.com.comercialpereira.repository;

import br.com.comercialpereira.entity.Sale;
import br.com.comercialpereira.enums.SaleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByUserIdAndStatus(Long userId, SaleStatus status);

    List<Sale> findByCustomerIdAndStatus(Long customerId, SaleStatus status);

    List<Sale> findByStatusAndSaleDateBetween(SaleStatus status, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT s FROM Sale s WHERE " +
            "(:customerId IS NULL OR s.customer.id = :customerId) AND " +
            "(:userId IS NULL OR s.user.id = :userId) AND " +
            "(:status IS NULL OR s.status = :status) AND " +
            "(:minTotal IS NULL OR s.total >= :minTotal) AND " +
            "(:maxTotal IS NULL OR s.total <= :maxTotal) AND " +
            "(:dateFrom IS NULL OR s.saleDate >= :dateFrom) AND " +
            "(:dateTo IS NULL OR s.saleDate <= :dateTo)")
    Page<Sale> findByFilters(@Param("customerId") Long customerId,
                             @Param("userId") Long userId,
                             @Param("status") SaleStatus status,
                             @Param("minTotal") BigDecimal minTotal,
                             @Param("maxTotal") BigDecimal maxTotal,
                             @Param("dateFrom") LocalDateTime dateFrom,
                             @Param("dateTo") LocalDateTime dateTo,
                             Pageable pageable);

    @Query("SELECT COUNT(s), SUM(s.total) FROM Sale s WHERE s.status = 'COMPLETED' AND s.saleDate BETWEEN :startDate AND :endDate")
    Object[] getSalesStatsByPeriod(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s.user.id, s.user.name, COUNT(s), SUM(s.total) FROM Sale s " +
            "WHERE s.status = 'COMPLETED' AND s.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY s.user.id, s.user.name ORDER BY SUM(s.total) DESC")
    List<Object[]> getSalesPerformanceByUser(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s.customer.id, s.customer.name, COUNT(s), SUM(s.total) FROM Sale s " +
            "WHERE s.status = 'COMPLETED' AND s.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY s.customer.id, s.customer.name ORDER BY SUM(s.total) DESC")
    List<Object[]> getTopCustomers(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);

    @Query("SELECT DATE(s.saleDate), COUNT(s), SUM(s.total) FROM Sale s " +
            "WHERE s.status = 'COMPLETED' AND s.saleDate BETWEEN :startDate AND :endDate " +
            "GROUP BY DATE(s.saleDate) ORDER BY DATE(s.saleDate)")
    List<Object[]> getDailySales(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT AVG(s.total) FROM Sale s WHERE s.status = 'COMPLETED'")
    BigDecimal getAverageOrderValue();

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = :status")
    long countByStatus(@Param("status") SaleStatus status);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.customer.id = :customerId")
    long countByCustomerId(Long customerId);
}