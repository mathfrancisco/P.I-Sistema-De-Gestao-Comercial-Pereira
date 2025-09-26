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

    /**
     * Cria uma nova venda.
     */
    @Transactional
    public SaleResponse create(CreateSaleRequest request) {
        // Busca o cliente ou lança exceção
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));

        // Busca o usuário logado (exemplo, ajuste conforme sua implementação de segurança)
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        // Cria a entidade Sale
        Sale sale = Sale.builder()
                .customer(customer)
                .user(user)
                .notes(request.getNotes())
                .discount(request.getDiscount())
                .tax(request.getTax())
                .status(SaleStatus.DRAFT) // Vendas começam como rascunho
                .saleDate(LocalDateTime.now())
                .build();

        // Processa e adiciona os itens da venda
        List<SaleItem> items = processSaleItems(request.getItems(), sale);
        sale.setItems(items);

        // Recalcula o total final da venda
        sale.recalculateTotal();

        // Salva a venda e seus itens (devido ao CascadeType.ALL)
        Sale savedSale = saleRepository.save(sale);
        return toSaleResponse(savedSale, true); // Retorna com itens
    }

    /**
     * Busca uma venda pelo ID.
     */
    @Transactional(readOnly = true)
    public SaleResponse findById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Venda não encontrada."));
        return toSaleResponse(sale, true); // Retorna com itens
    }

    /**
     * Lista todas as vendas com filtros e paginação.
     */
    @Transactional(readOnly = true)
    public PageResponse<SaleResponse> findAll(Long customerId, Long userId, SaleStatus status, Pageable pageable) {
        Page<Sale> salePage = saleRepository.findByFilters(customerId, userId, status, null, null, null, null, pageable);
        // Mapeia para DTO sem incluir os itens para performance
        Page<SaleResponse> responsePage = salePage.map(sale -> toSaleResponse(sale, false));
        return PageResponse.from(responsePage);
    }

    /**
     * Atualiza os dados de uma venda.
     */
    @Transactional
    public SaleResponse update(Long id, UpdateSaleRequest request) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Venda não encontrada."));

        // Validação: Apenas vendas em rascunho ou pendentes podem ser editadas.
        if (!sale.isEditable()) {
            throw new ApiException(HttpStatus.CONFLICT, "Esta venda não pode mais ser editada. Status: " + sale.getStatus());
        }

        // Atualiza campos
        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));
            sale.setCustomer(customer);
        }
        if (request.getNotes() != null) sale.setNotes(request.getNotes());
        if (request.getDiscount() != null) sale.setDiscount(request.getDiscount());
        if (request.getTax() != null) sale.setTax(request.getTax());

        sale.recalculateTotal(); // Recalcula o total com os novos descontos/taxas
        Sale updatedSale = saleRepository.save(sale);
        return toSaleResponse(updatedSale, true);
    }

    /**
     * Cancela uma venda.
     */
    @Transactional
    public SaleResponse cancel(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Venda não encontrada."));

        if (!sale.isCancellable()) {
            throw new ApiException(HttpStatus.CONFLICT, "Esta venda não pode ser cancelada. Status: " + sale.getStatus());
        }

        sale.setStatus(SaleStatus.CANCELLED);
        // Lógica adicional: Se o estoque foi reservado, aqui seria o lugar para devolvê-lo.

        Sale cancelledSale = saleRepository.save(sale);
        return toSaleResponse(cancelledSale, false);
    }
    @Transactional
    public SaleResponse addItem(Long saleId, AddSaleItemRequest itemRequest) {
        Sale sale = findSaleByIdOrThrow(saleId);
        if (!sale.isEditable()) {
            throw new ApiException(HttpStatus.CONFLICT, "Não é possível adicionar itens a esta venda. Status: " + sale.getStatus());
        }

        Product product = productRepository.findById(itemRequest.getProductId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Produto não encontrado."));

        // Opcional: Verificar se o item já existe na venda. Se sim, talvez seja melhor atualizar a quantidade.

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
            throw new ApiException(HttpStatus.CONFLICT, "Não é possível alterar itens desta venda. Status: " + sale.getStatus());
        }

        SaleItem itemToUpdate = sale.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item não encontrado nesta venda."));

        if (itemRequest.getQuantity() != null) itemToUpdate.setQuantity(itemRequest.getQuantity());
        if (itemRequest.getUnitPrice() != null) itemToUpdate.setUnitPrice(itemRequest.getUnitPrice());
        if (itemRequest.getDiscount() != null) itemToUpdate.setDiscount(itemRequest.getDiscount());

        // O @PreUpdate na entidade SaleItem irá recalcular o total do item

        sale.recalculateTotal(); // Recalcula o total da venda principal

        Sale updatedSale = saleRepository.save(sale);
        return toSaleResponse(updatedSale, true);
    }

    @Transactional
    public SaleResponse removeItem(Long saleId, Long itemId) {
        Sale sale = findSaleByIdOrThrow(saleId);
        if (!sale.isEditable()) {
            throw new ApiException(HttpStatus.CONFLICT, "Não é possível remover itens desta venda. Status: " + sale.getStatus());
        }

        boolean removed = sale.getItems().removeIf(item -> item.getId().equals(itemId));

        if (!removed) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Item não encontrado nesta venda.");
        }

        sale.recalculateTotal();

        Sale updatedSale = saleRepository.save(sale);
        return toSaleResponse(updatedSale, true);
    }

    // Adicione este método auxiliar para evitar repetição
    private Sale findSaleByIdOrThrow(Long saleId) {
        return saleRepository.findById(saleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Venda não encontrada."));
    }

    // --- Métodos Auxiliares ---

    private List<SaleItem> processSaleItems(List<CreateSaleRequest.SaleItemRequest> itemRequests, Sale sale) {
        return itemRequests.stream().map(itemRequest -> {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Produto com ID " + itemRequest.getProductId() + " não encontrado."));

            // Lógica de estoque: Verificar se há quantidade suficiente
             if (product.getInventory().getQuantity() < itemRequest.getQuantity()) {
                 throw new ApiException(HttpStatus.CONFLICT, "Estoque insuficiente para o produto: " + product.getName());
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