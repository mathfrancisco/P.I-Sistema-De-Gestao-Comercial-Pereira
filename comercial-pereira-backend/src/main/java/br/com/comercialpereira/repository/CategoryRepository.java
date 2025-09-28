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

    // SOLUÇÃO APLICADA: Query SQL nativa com CAST explícito para resolver o erro bytea
    @Query(value = "SELECT * FROM categories c WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "(c.description IS NOT NULL AND LOWER(CAST(c.description AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')))) AND " +
            "(:isActive IS NULL OR c.is_active = :isActive) AND " +
            "(:hasCnae IS NULL OR " +
            "(:hasCnae = true AND c.cnae IS NOT NULL AND c.cnae != '') OR " +
            "(:hasCnae = false AND (c.cnae IS NULL OR c.cnae = '')))",
            countQuery = "SELECT COUNT(*) FROM categories c WHERE " +
                    "(:search IS NULL OR :search = '' OR " +
                    "LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "(c.description IS NOT NULL AND LOWER(CAST(c.description AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')))) AND " +
                    "(:isActive IS NULL OR c.is_active = :isActive) AND " +
                    "(:hasCnae IS NULL OR " +
                    "(:hasCnae = true AND c.cnae IS NOT NULL AND c.cnae != '') OR " +
                    "(:hasCnae = false AND (c.cnae IS NULL OR c.cnae = '')))",
            nativeQuery = true)
    Page<Category> findByFilters(@Param("search") String search,
                                 @Param("isActive") Boolean isActive,
                                 @Param("hasCnae") Boolean hasCnae,
                                 Pageable pageable);

    @Query(value = "SELECT c.id, c.name, c.description, c.cnae, c.is_active, c.created_at, c.updated_at, " +
            "COALESCE(p.product_count, 0) as product_count " +
            "FROM categories c " +
            "LEFT JOIN (SELECT category_id, COUNT(*) as product_count FROM products WHERE is_active = true GROUP BY category_id) p " +
            "ON c.id = p.category_id " +
            "WHERE c.is_active = true " +
            "ORDER BY COALESCE(p.product_count, 0) DESC",
            nativeQuery = true)
    List<Object[]> findCategoriesWithProductCount();

    @Query("SELECT COUNT(c) FROM Category c WHERE c.isActive = :isActive")
    long countByIsActive(@Param("isActive") Boolean isActive);

    // Query simples sem filtros complexos
    @Query("SELECT c FROM Category c WHERE c.cnae IS NOT NULL AND c.cnae != '' AND c.isActive = true ORDER BY c.name")
    List<Category> findCategoriesWithCnae();

    @Query(value = "SELECT COUNT(DISTINCT c.id) FROM categories c " +
            "INNER JOIN products p ON c.id = p.category_id " +
            "WHERE c.is_active = true AND p.is_active = true",
            nativeQuery = true)
    long countCategoriesWithProducts();
}