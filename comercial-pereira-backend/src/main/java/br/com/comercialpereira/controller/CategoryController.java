package br.com.comercialpereira.controller;

import br.com.comercialpereira.dto.category.CreateCategoryRequest;
import br.com.comercialpereira.dto.category.UpdateCategoryRequest;
import br.com.comercialpereira.dto.category.CategoryFilters;
import br.com.comercialpereira.dto.category.CategoryResponse;
import br.com.comercialpereira.entity.User;
import br.com.comercialpereira.services.category.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // Método auxiliar para obter User-ID do contexto de segurança
    private Long getCurrentUserId(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CreateCategoryRequest request,
            Authentication authentication) {

        Long currentUserId = getCurrentUserId(authentication);
        CategoryResponse category = categoryService.create(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getCategories(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean hasCnae,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(defaultValue = "false") Boolean includeProductCount) {

        CategoryFilters filters = CategoryFilters.builder()
                .search(search)
                .isActive(isActive)
                .hasCnae(hasCnae)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .includeProductCount(includeProductCount)
                .build();

        Page<CategoryResponse> categories = categoryService.findMany(filters);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponse category = categoryService.findById(id);
        return ResponseEntity.ok(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request,
            Authentication authentication) {

        Long currentUserId = getCurrentUserId(authentication);
        CategoryResponse category = categoryService.update(id, request, currentUserId);
        return ResponseEntity.ok(category);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            Authentication authentication,
            @RequestParam(required = false) String reason) {

        Long currentUserId = getCurrentUserId(authentication);
        categoryService.delete(id, currentUserId, reason);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<CategoryResponse>> searchCategories(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {

        List<CategoryResponse> categories = categoryService.search(query, limit);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/active")
    public ResponseEntity<List<CategoryResponse>> getActiveCategories() {
        List<CategoryResponse> categories = categoryService.getActiveCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/with-cnae")
    public ResponseEntity<List<CategoryResponse>> getCategoriesWithCnae() {
        List<CategoryResponse> categories = categoryService.getCategoriesWithCnae();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/for-select")
    public ResponseEntity<List<Map<String, Object>>> getCategoriesForSelect() {
        List<Map<String, Object>> categories = categoryService.getCategoriesForSelect();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getCategoryStatistics() {
        Map<String, Object> stats = categoryService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/by-name/{name}")
    public ResponseEntity<CategoryResponse> getCategoryByName(@PathVariable String name) {
        CategoryResponse category = categoryService.findByName(name);
        if (category != null) {
            return ResponseEntity.ok(category);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/by-cnae/{cnae}")
    public ResponseEntity<CategoryResponse> getCategoryByCnae(@PathVariable String cnae) {
        CategoryResponse category = categoryService.findByCnae(cnae);
        if (category != null) {
            return ResponseEntity.ok(category);
        }
        return ResponseEntity.notFound().build();
    }
}