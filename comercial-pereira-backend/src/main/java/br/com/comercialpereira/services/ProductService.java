package br.com.comercialpereira.services;

import br.com.comercialpereira.dto.product.*;
import br.com.comercialpereira.entity.Category;
import br.com.comercialpereira.entity.Product;
import br.com.comercialpereira.entity.Supplier;
import br.com.comercialpereira.entity.Inventory;
import br.com.comercialpereira.exception.ApiException;
import br.com.comercialpereira.repository.CategoryRepository;
import br.com.comercialpereira.repository.ProductRepository;
import br.com.comercialpereira.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        log.info("Creating product with code: {}", request.getCode());

        // Validar categoria existe e está ativa
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ApiException("Categoria não encontrada", HttpStatus.NOT_FOUND));

        if (!category.getIsActive()) {
            throw new ApiException("Categoria está inativa", HttpStatus.BAD_REQUEST);
        }

        // Validar fornecedor se informado
        Supplier supplier = null;
        if (request.getSupplierId() != null) {
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ApiException("Fornecedor não encontrado", HttpStatus.NOT_FOUND));

            if (!supplier.getIsActive()) {
                throw new ApiException("Fornecedor está inativo", HttpStatus.BAD_REQUEST);
            }
        }

        // Validar código único
        String formattedCode = formatProductCode(request.getCode());
        if (productRepository.existsByCode(formattedCode)) {
            throw new ApiException("Código já está em uso", HttpStatus.CONFLICT);
        }

        // Validar código de barras único se informado
        if (request.getBarcode() != null && !request.getBarcode().isEmpty()) {
            if (productRepository.existsByBarcode(request.getBarcode())) {
                throw new ApiException("Código de barras já está em uso", HttpStatus.CONFLICT);
            }
        }

        // Criar produto
        Product product = Product.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .price(request.getPrice())
                .code(formattedCode)
                .barcode(request.getBarcode())
                .category(category)
                .supplier(supplier)
                .isActive(request.getIsActive())
                .build();

        Product savedProduct = productRepository.save(product);

        // Criar estoque inicial
        Inventory inventory = Inventory.builder()
                .product(savedProduct)
                .quantity(request.getInitialStock())
                .minStock(request.getMinStock())
                .maxStock(request.getMaxStock())
                .location(request.getLocation())
                .build();

        savedProduct.setInventory(inventory);

        log.info("Product created successfully with ID: {}", savedProduct.getId());
        return convertToProductResponse(savedProduct);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> findByFilters(ProductFilters filters) {
        log.debug("Finding products with filters: {}", filters);

        Pageable pageable = PageRequest.of(
                filters.getPage(),
                filters.getSize(),
                buildSort(filters.getSortBy(), filters.getSortOrder())
        );

        Page<Product> products = productRepository.findByFilters(
                filters.getSearch(),
                filters.getCategoryId(),
                filters.getSupplierId(),
                filters.getIsActive(),
                filters.getMinPrice(),
                filters.getMaxPrice(),
                pageable
        );

        return products.map(this::convertToProductResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        log.debug("Finding product by ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND));

        return convertToProductResponse(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse findByCode(String code) {
        log.debug("Finding product by code: {}", code);

        String formattedCode = formatProductCode(code);
        Product product = productRepository.findByCode(formattedCode)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND));

        return convertToProductResponse(product);
    }

    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest request) {
        log.info("Updating product with ID: {}", id);

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND));

        // Validar categoria se alterando
        if (request.getCategoryId() != null && !request.getCategoryId().equals(existingProduct.getCategory().getId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException("Categoria não encontrada", HttpStatus.NOT_FOUND));

            if (!category.getIsActive()) {
                throw new ApiException("Categoria está inativa", HttpStatus.BAD_REQUEST);
            }
            existingProduct.setCategory(category);
        }

        // Validar fornecedor se alterando
        if (request.getSupplierId() != null) {
            if (!request.getSupplierId().equals(existingProduct.getSupplier() != null ? existingProduct.getSupplier().getId() : null)) {
                Supplier supplier = supplierRepository.findById(request.getSupplierId())
                        .orElseThrow(() -> new ApiException("Fornecedor não encontrado", HttpStatus.NOT_FOUND));

                if (!supplier.getIsActive()) {
                    throw new ApiException("Fornecedor está inativo", HttpStatus.BAD_REQUEST);
                }
                existingProduct.setSupplier(supplier);
            }
        }

        // Validar código único se alterando
        if (request.getCode() != null && !request.getCode().equals(existingProduct.getCode())) {
            String formattedCode = formatProductCode(request.getCode());
            if (productRepository.existsByCodeAndIdNot(formattedCode, id)) {
                throw new ApiException("Código já está em uso", HttpStatus.CONFLICT);
            }
            existingProduct.setCode(formattedCode);
        }

        // Validar código de barras se alterando
        if (request.getBarcode() != null && !request.getBarcode().equals(existingProduct.getBarcode())) {
            if (!request.getBarcode().isEmpty() && productRepository.existsByBarcode(request.getBarcode())) {
                throw new ApiException("Código de barras já está em uso", HttpStatus.CONFLICT);
            }
            existingProduct.setBarcode(request.getBarcode().isEmpty() ? null : request.getBarcode());
        }

        // Atualizar campos
        if (request.getName() != null) {
            existingProduct.setName(request.getName().trim());
        }
        if (request.getDescription() != null) {
            existingProduct.setDescription(request.getDescription().trim());
        }
        if (request.getPrice() != null) {
            existingProduct.setPrice(request.getPrice());
        }
        if (request.getIsActive() != null) {
            existingProduct.setIsActive(request.getIsActive());
        }

        Product updatedProduct = productRepository.save(existingProduct);

        log.info("Product updated successfully with ID: {}", updatedProduct.getId());
        return convertToProductResponse(updatedProduct);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND));

        // Verificar se produto pode ser excluído (soft delete)
        if (product.getSaleItems() != null && !product.getSaleItems().isEmpty()) {
            throw new ApiException("Produto não pode ser excluído pois possui vendas associadas", HttpStatus.BAD_REQUEST);
        }

        // Soft delete
        product.setIsActive(false);
        productRepository.save(product);

        log.info("Product soft deleted successfully with ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> search(String query, Long categoryId, Integer limit, Boolean includeInactive) {
        log.debug("Searching products with query: {}", query);

        List<Product> products;

        if (categoryId != null) {
            products = productRepository.findByCategoryIdAndIsActive(categoryId, includeInactive != null ? includeInactive : true);
        } else {
            Pageable pageable = PageRequest.of(0, limit != null ? limit : 20);
            products = productRepository.findByNameOrCodeContainingIgnoreCase(query, pageable);
        }

        return products.stream()
                .map(this::convertToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getActiveProducts() {
        log.debug("Getting all active products");

        List<Product> products = productRepository.findAll().stream()
                .filter(Product::getIsActive)
                .collect(Collectors.toList());

        return products.stream()
                .map(this::convertToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsByCategory(Long categoryId) {
        log.debug("Getting products by category: {}", categoryId);

        List<Product> products = productRepository.findByCategoryIdAndIsActive(categoryId, true);

        return products.stream()
                .map(this::convertToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductsBySupplier(Long supplierId) {
        log.debug("Getting products by supplier: {}", supplierId);

        List<Product> products = productRepository.findBySupplierIdAndIsActive(supplierId, true);

        return products.stream()
                .map(this::convertToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        log.debug("Getting products with low stock");

        List<Product> products = productRepository.findProductsWithLowStock();

        return products.stream()
                .map(this::convertToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getOutOfStockProducts() {
        log.debug("Getting products out of stock");

        List<Product> products = productRepository.findProductsOutOfStock();

        return products.stream()
                .map(this::convertToProductResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean checkCodeAvailability(String code, Long excludeId) {
        String formattedCode = formatProductCode(code);

        if (excludeId != null) {
            return !productRepository.existsByCodeAndIdNot(formattedCode, excludeId);
        }

        return !productRepository.existsByCode(formattedCode);
    }

    private ProductResponse convertToProductResponse(Product product) {
        ProductResponse.CategoryInfo categoryInfo = null;
        if (product.getCategory() != null) {
            categoryInfo = ProductResponse.CategoryInfo.builder()
                    .id(product.getCategory().getId())
                    .name(product.getCategory().getName())
                    .description(product.getCategory().getDescription())
                    .build();
        }

        ProductResponse.SupplierInfo supplierInfo = null;
        if (product.getSupplier() != null) {
            supplierInfo = ProductResponse.SupplierInfo.builder()
                    .id(product.getSupplier().getId())
                    .name(product.getSupplier().getName())
                    .contactPerson(product.getSupplier().getContactPerson())
                    .build();
        }

        ProductResponse.InventoryInfo inventoryInfo = null;
        if (product.getInventory() != null) {
            Inventory inventory = product.getInventory();
            inventoryInfo = ProductResponse.InventoryInfo.builder()
                    .quantity(inventory.getQuantity())
                    .minStock(inventory.getMinStock())
                    .maxStock(inventory.getMaxStock())
                    .location(inventory.getLocation())
                    .isLowStock(inventory.getQuantity() <= inventory.getMinStock())
                    .isOutOfStock(inventory.getQuantity() == 0)
                    .build();
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .code(product.getCode())
                .barcode(product.getBarcode())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .category(categoryInfo)
                .supplier(supplierInfo)
                .inventory(inventoryInfo)
                .build();
    }

    private String formatProductCode(String code) {
        return code != null ? code.toUpperCase().trim() : null;
    }

    private Sort buildSort(String sortBy, String sortOrder) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ? Sort.Direction.DESC : Sort.Direction.ASC;

        switch (sortBy) {
            case "name":
                return Sort.by(direction, "name");
            case "code":
                return Sort.by(direction, "code");
            case "price":
                return Sort.by(direction, "price");
            case "createdAt":
                return Sort.by(direction, "createdAt");
            case "updatedAt":
                return Sort.by(direction, "updatedAt");
            default:
                return Sort.by(Sort.Direction.ASC, "name");
        }
    }
}