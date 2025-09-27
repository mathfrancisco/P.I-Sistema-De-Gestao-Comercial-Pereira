package br.com.comercialpereira.services;

import br.com.comercialpereira.dto.PageResponse;
import br.com.comercialpereira.dto.sale.*;
import br.com.comercialpereira.entity.*;
import br.com.comercialpereira.enums.SaleStatus;
import br.com.comercialpereira.exception.ApiException;
import br.com.comercialpereira.repository.CustomerRepository;
import br.com.comercialpereira.repository.ProductRepository;
import br.com.comercialpereira.repository.SaleRepository;
import br.com.comercialpereira.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public SaleResponse create(CreateSaleRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ApiException("Cliente não encontrado.", HttpStatus.NOT_FOUND));

        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException("Usuário não encontrado.", HttpStatus.NOT_FOUND));

        Sale sale = Sale.builder()
                .customer(customer)
                .user(user)
                .notes(request.getNotes())
                .discount(request.getDiscount())
                .tax(request.getTax())
                .status(SaleStatus.DRAFT)
                .saleDate(LocalDateTime.now())
                .build();

        List<SaleItem> items = processSaleItems(request.getItems(), sale);
        sale.setItems(items);
        sale.recalculateTotal();

        Sale savedSale = saleRepository.save(sale);
        return toSaleResponse(savedSale, true);
    }

    @Transactional(readOnly = true)
    public SaleResponse findById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Venda não encontrada.", HttpStatus.NOT_FOUND));
        return toSaleResponse(sale, true);
    }

    @Transactional(readOnly = true)
    public PageResponse<SaleResponse> findAll(Long customerId, Long userId, SaleStatus status, Pageable pageable) {
        Page<Sale> salePage = saleRepository.findByFilters(customerId, userId, status, null, null, null, null, pageable);
        Page<SaleResponse> responsePage = salePage.map(sale -> toSaleResponse(sale, false));
        return PageResponse.from(responsePage);
    }

    @Transactional
    public SaleResponse update(Long id, UpdateSaleRequest request) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Venda não encontrada.", HttpStatus.NOT_FOUND));

        if (!sale.isEditable()) {
            throw new ApiException("Esta venda não pode mais ser editada. Status: " + sale.getStatus(), HttpStatus.CONFLICT);
        }

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ApiException("Cliente não encontrado.", HttpStatus.NOT_FOUND));
            sale.setCustomer(customer);
        }
        if (request.getNotes() != null) sale.setNotes(request.getNotes());
        if (request.getDiscount() != null) sale.setDiscount(request.getDiscount());
        if (request.getTax() != null) sale.setTax(request.getTax());

        sale.recalculateTotal();
        Sale updatedSale = saleRepository.save(sale);
        return toSaleResponse(updatedSale, true);
    }

    @Transactional
    public SaleResponse cancel(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ApiException("Venda não encontrada.", HttpStatus.NOT_FOUND));

        if (!sale.isCancellable()) {
            throw new ApiException("Esta venda não pode ser cancelada. Status: " + sale.getStatus(), HttpStatus.CONFLICT);
        }

        sale.setStatus(SaleStatus.CANCELLED);
        Sale cancelledSale = saleRepository.save(sale);
        return toSaleResponse(cancelledSale, false);
    }

    @Transactional
    public SaleResponse addItem(Long saleId, AddSaleItemRequest itemRequest) {
        Sale sale = findSaleByIdOrThrow(saleId);
        if (!sale.isEditable()) {
            throw new ApiException("Não é possível adicionar itens a esta venda. Status: " + sale.getStatus(), HttpStatus.CONFLICT);
        }

        Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ApiException("Produto não encontrado.", HttpStatus.NOT_FOUND));

        SaleItem newItem = SaleItem.builder()
                .sale(sale)
                .product(product)
                .quantity(itemRequest.getQuantity())
                .unitPrice(itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : product.getPrice())
                .discount(itemRequest.getDiscount())
                .build();

        sale.getItems().add(newItem);
        sale.recalculateTotal();

        Sale updatedSale = saleRepository.save(sale);
        return toSaleResponse(updatedSale, true);
    }

    @Transactional
    public SaleResponse updateItem(Long saleId, Long itemId, UpdateSaleItemRequest itemRequest) {
        Sale sale = findSaleByIdOrThrow(saleId);
        if (!sale.isEditable()) {
            throw new ApiException("Não é possível alterar itens desta venda. Status: " + sale.getStatus(), HttpStatus.CONFLICT);
        }

        SaleItem itemToUpdate = sale.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ApiException("Item não encontrado nesta venda.", HttpStatus.NOT_FOUND));

        if (itemRequest.getQuantity() != null) itemToUpdate.setQuantity(itemRequest.getQuantity());
        if (itemRequest.getUnitPrice() != null) itemToUpdate.setUnitPrice(itemRequest.getUnitPrice());
        if (itemRequest.getDiscount() != null) itemToUpdate.setDiscount(itemRequest.getDiscount());

        sale.recalculateTotal();

        Sale updatedSale = saleRepository.save(sale);
        return toSaleResponse(updatedSale, true);
    }

    @Transactional
    public SaleResponse removeItem(Long saleId, Long itemId) {
        Sale sale = findSaleByIdOrThrow(saleId);
        if (!sale.isEditable()) {
            throw new ApiException("Não é possível remover itens desta venda. Status: " + sale.getStatus(), HttpStatus.CONFLICT);
        }

        boolean removed = sale.getItems().removeIf(item -> item.getId().equals(itemId));

        if (!removed) {
            throw new ApiException("Item não encontrado nesta venda.", HttpStatus.NOT_FOUND);
        }

        sale.recalculateTotal();

        Sale updatedSale = saleRepository.save(sale);
        return toSaleResponse(updatedSale, true);
    }

    private Sale findSaleByIdOrThrow(Long saleId) {
        return saleRepository.findById(saleId)
                .orElseThrow(() -> new ApiException("Venda não encontrada.", HttpStatus.NOT_FOUND));
    }

    private List<SaleItem> processSaleItems(List<CreateSaleRequest.SaleItemRequest> itemRequests, Sale sale) {
        return itemRequests.stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ApiException("Produto com ID " + itemRequest.getProductId() + " não encontrado.", HttpStatus.NOT_FOUND));

            if (product.getInventory().getQuantity() < itemRequest.getQuantity()) {
                throw new ApiException("Estoque insuficiente para o produto: " + product.getName(), HttpStatus.CONFLICT);
            }

            BigDecimal unitPrice = (itemRequest.getUnitPrice() != null) ? itemRequest.getUnitPrice() : product.getPrice();

            return SaleItem.builder()
                    .sale(sale)
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .discount(itemRequest.getDiscount())
                    .build();
        }).collect(Collectors.toList());
    }

    private SaleResponse toSaleResponse(Sale sale, boolean includeItems) {
        SaleResponse.UserInfo user = SaleResponse.UserInfo.builder()
                .id(sale.getUser().getId())
                .name(sale.getUser().getName())
                .build();

        SaleResponse.CustomerInfo customer = SaleResponse.CustomerInfo.builder()
                .id(sale.getCustomer().getId())
                .name(sale.getCustomer().getName())
                .type(sale.getCustomer().getType().name())
                .document(sale.getCustomer().getDocument())
                .build();

        SaleResponse response = SaleResponse.builder()
                .id(sale.getId())
                .total(sale.getTotal())
                .discount(sale.getDiscount())
                .tax(sale.getTax())
                .status(sale.getStatus())
                .notes(sale.getNotes())
                .saleDate(sale.getSaleDate())
                .createdAt(sale.getCreatedAt())
                .updatedAt(sale.getUpdatedAt())
                .user(user)
                .customer(customer)
                .itemCount(sale.getItems() != null ? sale.getItems().size() : 0)
                .build();

        if (includeItems && sale.getItems() != null) {
            response.setItems(sale.getItems().stream()
                    .map(this::toSaleItemInfo)
                    .collect(Collectors.toList()));
        }

        return response;
    }

    private SaleResponse.SaleItemInfo toSaleItemInfo(SaleItem item) {
        SaleResponse.SaleItemInfo.ProductInfo product = SaleResponse.SaleItemInfo.ProductInfo.builder()
                .id(item.getProduct().getId())
                .name(item.getProduct().getName())
                .code(item.getProduct().getCode())
                .categoryName(item.getProduct().getCategory().getName())
                .build();

        return SaleResponse.SaleItemInfo.builder()
                .id(item.getId())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .total(item.getTotal())
                .discount(item.getDiscount())
                .product(product)
                .build();
    }
}
