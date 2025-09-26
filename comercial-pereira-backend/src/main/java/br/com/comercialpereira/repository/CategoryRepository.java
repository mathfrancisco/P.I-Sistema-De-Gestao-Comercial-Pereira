package br.com.comercialpereira.repository;

import br.com.comercialpereira.entity.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    Optional<Category> findByCnae(String cnae);

    boolean existsByName(String name);

    boolean existsByCnae(String cnae);

    boolean existsByNameAndIdNot(String name, Long id);

    boolean existsByCnaeAndIdNot(String cnae, Long id);

    List<Category> findByIsActiveOrderByName(Boolean isActive);

    @Query("SELECT c FROM Category c WHERE " +
            "(:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:isActive IS NULL OR c.isActive = :isActive) AND " +
            "(:hasCnae IS NULL OR (:hasCnae = true AND c.cnae IS NOT NULL) OR (:hasCnae = false AND c.cnae IS NULL))")
    Page<Category> findByFilters(@Param("search") String search,
                                 @Param("isActive") Boolean isActive,
                                 @Param("hasCnae") Boolean hasCnae,
                                 Pageable pageable);

    @Query("SELECT c, COUNT(p) as productCount FROM Category c LEFT JOIN c.products p " +
            "WHERE c.isActive = true GROUP BY c.id ORDER BY productCount DESC")
    List<Object[]> findCategoriesWithProductCount();

    @Query("SELECT COUNT(c) FROM Category c WHERE c.isActive = :isActive")
    long countByIsActive(@Param("isActive") Boolean isActive);

    @Query("SELECT c FROM Category c WHERE c.cnae IS NOT NULL AND c.isActive = true ORDER BY c.name")
    List<Category> findCategoriesWithCnae();
}