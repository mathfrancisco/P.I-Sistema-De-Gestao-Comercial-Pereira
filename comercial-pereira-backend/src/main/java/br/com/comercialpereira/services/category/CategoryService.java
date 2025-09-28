package br.com.comercialpereira.services.category;

import br.com.comercialpereira.dto.category.*;
import br.com.comercialpereira.entity.Category;
import br.com.comercialpereira.repository.CategoryRepository;
import br.com.comercialpereira.exception.ApiException;
import br.com.comercialpereira.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryValidationService validationService;
    private final ProductRepository productRepository;

    private static final String CATEGORY_NOT_FOUND = "Categoria não encontrada";
    private static final String CATEGORY_NAME_EXISTS = "Categoria com este nome já existe";
    private static final String CNAE_EXISTS = "CNAE já está sendo usado por outra categoria";
    private static final String CANNOT_DEACTIVATE_WITH_PRODUCTS = "Não é possível desativar categoria que possui produtos ativos";
    private static final String CANNOT_DELETE_WITH_PRODUCTS = "Não é possível deletar categoria que possui produtos";

    // =================== CREATE ===================

    public CategoryResponse create(CreateCategoryRequest request, Long currentUserId) {
        try {
            // 1. Validações de negócio
            List<String> businessErrors = validationService.validateCreateCategoryBusinessRules(request);
            if (!businessErrors.isEmpty()) {
                throw new ApiException(String.join(", ", businessErrors), HttpStatus.BAD_REQUEST);
            }

            // 2. Validar se nome já existe
            if (categoryRepository.existsByName(request.getName().trim())) {
                throw new ApiException(CATEGORY_NAME_EXISTS, HttpStatus.CONFLICT);
            }

            // 3. Validar se CNAE já existe (se fornecido)
            if (request.getCnae() != null && !request.getCnae().trim().isEmpty()) {
                if (categoryRepository.existsByCnae(request.getCnae().trim())) {
                    throw new ApiException(CNAE_EXISTS, HttpStatus.CONFLICT);
                }
            }

            // 4. Criar categoria
            Category category = Category.builder()
                    .name(request.getName().trim())
                    .description(request.getDescription() != null ? request.getDescription().trim() : null)
                    .cnae(request.getCnae() != null && !request.getCnae().trim().isEmpty() ? request.getCnae().trim() : null)
                    .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                    .build();

            Category savedCategory = categoryRepository.save(category);

            // 5. Log da operação
            logCategoryOperation(currentUserId, "CREATE", savedCategory.getId(),
                    Map.of("new", Map.of(
                            "name", savedCategory.getName(),
                            "cnae", savedCategory.getCnae() != null ? savedCategory.getCnae() : ""
                    ))
            );

            return convertToCategoryResponse(savedCategory);

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao criar categoria", e);
            throw new ApiException("Erro ao criar categoria", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== READ ===================

    @Transactional(readOnly = true)
    public Page<CategoryResponse> findMany(CategoryFilters filters) {
        try {
            // Preparar paginação
            Sort sort = Sort.by(
                    filters.getSortOrder().equalsIgnoreCase("desc")
                            ? Sort.Direction.DESC
                            : Sort.Direction.ASC,
                    filters.getSortBy()
            );

            Pageable pageable = PageRequest.of(
                    filters.getPage(),
                    filters.getSize(),
                    sort
            );

            // Buscar categorias com filtros
            Page<Category> categoriesPage = categoryRepository.findByFilters(
                    filters.getSearch(),
                    filters.getIsActive(),
                    filters.getHasCnae(),
                    pageable
            );

            // Converter para response
            return categoriesPage.map(category -> {
                CategoryResponse response = convertToCategoryResponse(category);

                // Incluir contagem de produtos se solicitado
                if (filters.getIncludeProductCount()) {
                    response.setProductCount(getProductCount(category.getId()));
                }

                return response;
            });

        } catch (Exception e) {
            log.error("Erro ao buscar categorias", e);
            throw new ApiException("Erro ao buscar categorias", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public CategoryResponse findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND));

        CategoryResponse response = convertToCategoryResponse(category);
        response.setProductCount(getProductCount(id));

        return response;
    }

    @Transactional(readOnly = true)
    public CategoryResponse findByName(String name) {
        return categoryRepository.findByName(name)
                .map(this::convertToCategoryResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public CategoryResponse findByCnae(String cnae) {
        return categoryRepository.findByCnae(cnae)
                .map(this::convertToCategoryResponse)
                .orElse(null);
    }

    // =================== UPDATE ===================

    public CategoryResponse update(Long id, UpdateCategoryRequest request, Long currentUserId) {
        try {
            // 1. Verificar se categoria existe
            Category existingCategory = categoryRepository.findById(id)
                    .orElseThrow(() -> new ApiException(CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND));

            // 2. Validações de negócio
            List<String> businessErrors = validationService.validateUpdateCategoryBusinessRules(request);
            if (!businessErrors.isEmpty()) {
                throw new ApiException(String.join(", ", businessErrors), HttpStatus.BAD_REQUEST);
            }

            // 3. Validar nome único (se alterando)
            if (request.getName() != null && !request.getName().trim().equals(existingCategory.getName())) {
                if (categoryRepository.existsByNameAndIdNot(request.getName().trim(), id)) {
                    throw new ApiException(CATEGORY_NAME_EXISTS, HttpStatus.CONFLICT);
                }
            }

            // 4. Validar CNAE único (se alterando)
            if (request.getCnae() != null) {
                String newCnae = request.getCnae().trim().isEmpty() ? null : request.getCnae().trim();
                String currentCnae = existingCategory.getCnae();

                if (!java.util.Objects.equals(newCnae, currentCnae)) {
                    if (newCnae != null && categoryRepository.existsByCnaeAndIdNot(newCnae, id)) {
                        throw new ApiException(CNAE_EXISTS, HttpStatus.CONFLICT);
                    }
                }
            }

            // 5. Validar desativação com produtos ativos
            if (request.getIsActive() != null && !request.getIsActive() && existingCategory.getIsActive()) {
                int activeProducts = getActiveProductCount(id);
                if (activeProducts > 0) {
                    throw new ApiException(CANNOT_DEACTIVATE_WITH_PRODUCTS, HttpStatus.CONFLICT);
                }
            }

            // 6. Atualizar campos
            if (request.getName() != null) {
                existingCategory.setName(request.getName().trim());
            }
            if (request.getDescription() != null) {
                existingCategory.setDescription(request.getDescription().trim());
            }
            if (request.getCnae() != null) {
                String cnae = request.getCnae().trim().isEmpty() ? null : request.getCnae().trim();
                existingCategory.setCnae(cnae);
            }
            if (request.getIsActive() != null) {
                existingCategory.setIsActive(request.getIsActive());
            }

            Category updatedCategory = categoryRepository.save(existingCategory);

            // 7. Log da operação
            logCategoryOperation(currentUserId, "UPDATE", id,
                    Map.of(
                            "old", Map.of(
                                    "name", existingCategory.getName(),
                                    "cnae", existingCategory.getCnae() != null ? existingCategory.getCnae() : ""
                            ),
                            "new", Map.of(
                                    "name", updatedCategory.getName(),
                                    "cnae", updatedCategory.getCnae() != null ? updatedCategory.getCnae() : ""
                            )
                    )
            );

            return convertToCategoryResponse(updatedCategory);

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao atualizar categoria", e);
            throw new ApiException("Erro ao atualizar categoria", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== DELETE ===================

    public void delete(Long id, Long currentUserId, String reason) {
        try {
            // 1. Verificar se categoria existe
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new ApiException(CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND));

            // 2. Verificar se tem produtos
            int productCount = getProductCount(id);
            if (productCount > 0) {
                throw new ApiException(CANNOT_DELETE_WITH_PRODUCTS, HttpStatus.CONFLICT);
            }

            // 3. Deletar categoria
            categoryRepository.delete(category);

            // 4. Log da operação
            logCategoryOperation(currentUserId, "DELETE", id,
                    Map.of(
                            "reason", reason != null ? reason : "",
                            "old", Map.of(
                                    "name", category.getName(),
                                    "cnae", category.getCnae() != null ? category.getCnae() : ""
                            )
                    )
            );

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Erro ao excluir categoria", e);
            throw new ApiException("Erro ao excluir categoria", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== SEARCH AND FILTERS ===================

    @Transactional(readOnly = true)
    public List<CategoryResponse> search(String query, int limit) {
        try {
            CategoryFilters filters = CategoryFilters.builder()
                    .search(query)
                    .isActive(true)
                    .page(0)
                    .size(limit)
                    .sortBy("name")
                    .sortOrder("asc")
                    .build();

            Sort sort = Sort.by(Sort.Direction.ASC, "name");
            Pageable pageable = PageRequest.of(0, limit, sort);

            Page<Category> categories = categoryRepository.findByFilters(
                    query, true, null, pageable
            );

            return categories.getContent().stream()
                    .map(this::convertToCategoryResponse)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Erro na busca de categorias", e);
            throw new ApiException("Erro na busca de categorias", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        try {
            List<Category> categories = categoryRepository.findByIsActiveOrderByName(true);
            return categories.stream()
                    .map(this::convertToCategoryResponse)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Erro ao buscar categorias ativas", e);
            throw new ApiException("Erro ao buscar categorias ativas", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesWithCnae() {
        try {
            CategoryFilters filters = CategoryFilters.builder()
                    .hasCnae(true)
                    .isActive(true)
                    .sortBy("name")
                    .sortOrder("asc")
                    .build();

            Sort sort = Sort.by(Sort.Direction.ASC, "name");
            Pageable pageable = PageRequest.of(0, Integer.MAX_VALUE, sort);

            Page<Category> categories = categoryRepository.findByFilters(
                    null, true, true, pageable
            );

            return categories.getContent().stream()
                    .map(this::convertToCategoryResponse)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Erro ao buscar categorias com CNAE", e);
            throw new ApiException("Erro ao buscar categorias com CNAE", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // =================== STATISTICS ===================

    @Transactional(readOnly = true)
    public Map<String, Object> getStatistics() {
        try {
            // Estatísticas básicas
            long total = categoryRepository.count();
            long active = categoryRepository.countByIsActive(true);
            long inactive = total - active;

            // CORRIGIDO: Usar os métodos auxiliares corretamente
            long withCnae = getCategoriesWithCnaeCount();
            long withProducts = getCategoriesWithProductsCount();

            // Buscar categorias com contagem de produtos
            List<Object[]> categoriesWithProductCount = categoryRepository.findCategoriesWithProductCount();

            // Processar dados das categorias com produtos
            Map<String, Long> productsByCategory = new HashMap<>();
            List<Map<String, Object>> topCategories = new ArrayList<>();

            if (!categoriesWithProductCount.isEmpty()) {
                // Converter resultado SQL nativo para Map
                productsByCategory = categoriesWithProductCount.stream()
                        .filter(row -> row.length >= 8 && row[7] != null)
                        .collect(Collectors.toMap(
                                row -> (String) row[1], // name na posição 1
                                row -> ((Number) row[7]).longValue() // product_count na posição 7
                        ));

                // Top 10 categorias
                topCategories = categoriesWithProductCount.stream()
                        .filter(row -> row.length >= 8)
                        .limit(10)
                        .map(row -> {
                            Map<String, Object> categoryMap = new HashMap<>();
                            categoryMap.put("id", ((Number) row[0]).longValue());
                            categoryMap.put("name", (String) row[1]);
                            categoryMap.put("productCount", ((Number) row[7]).longValue());
                            categoryMap.put("totalRevenue", 0L);
                            return categoryMap;
                        })
                        .collect(Collectors.toList());
            }

            // Resultado final
            Map<String, Object> result = new HashMap<>();
            result.put("total", total);
            result.put("active", active);
            result.put("inactive", inactive);
            result.put("withCnae", withCnae);
            result.put("withProducts", withProducts);
            result.put("productsByCategory", productsByCategory);
            result.put("topCategories", topCategories);

            return result;

        } catch (Exception e) {
            log.error("Erro ao obter estatísticas de categorias", e);
            throw new ApiException("Erro ao obter estatísticas de categorias", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // =================== UTILITIES ===================

    public Map<String, Object> formatCategoryForSelect(Category category) {
        return Map.of(
                "value", category.getId(),
                "label", category.getCnae() != null
                        ? category.getName() + " (" + category.getCnae() + ")"
                        : category.getName(),
                "cnae", category.getCnae() != null ? category.getCnae() : "",
                "isActive", category.getIsActive()
        );
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getCategoriesForSelect() {
        List<Category> categories = categoryRepository.findByIsActiveOrderByName(true);
        return categories.stream()
                .map(this::formatCategoryForSelect)
                .collect(Collectors.toList());
    }

    // =================== PRIVATE METHODS ===================

    private void logCategoryOperation(Long currentUserId, String action, Long targetCategoryId, Map<String, Object> data) {
        try {
            log.info("[CATEGORY_AUDIT] User {} performed {} on category {}",
                    currentUserId, action, targetCategoryId);
            log.debug("[CATEGORY_AUDIT] Data: {}", data);

            // TODO: Implementar tabela de auditoria no banco se necessário
            // auditService.log(currentUserId, action, "CATEGORIES", targetCategoryId, data);

        } catch (Exception e) {
            log.error("Erro ao registrar log de auditoria", e);
        }
    }

    private CategoryResponse convertToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .cnae(category.getCnae())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    private int getProductCount(Long categoryId) {
        try {
            return productRepository.findByCategoryIdAndIsActive(categoryId, true).size();
        } catch (Exception e) {
            log.warn("Erro ao contar produtos da categoria {}, retornando 0", categoryId, e);
            return 0;
        }
    }

    private int getActiveProductCount(Long categoryId) {
        try {
            return productRepository.findByCategoryIdAndIsActive(categoryId, true).size();
        } catch (Exception e) {
            log.warn("Erro ao contar produtos ativos da categoria {}, retornando 0", categoryId, e);
            return 0;
        }
    }

    private long getCategoriesWithCnaeCount() {
        try {
            // Usar a query simples do repository
            return categoryRepository.findCategoriesWithCnae().size();
        } catch (Exception e) {
            log.warn("Erro ao contar categorias com CNAE, retornando 0", e);
            return 0;
        }
    }

    private long getCategoriesWithProductsCount() {
        try {
            return categoryRepository.countCategoriesWithProducts();
        } catch (Exception e) {
            log.warn("Erro ao contar categorias com produtos, retornando 0", e);
            return 0;
        }
    }
}