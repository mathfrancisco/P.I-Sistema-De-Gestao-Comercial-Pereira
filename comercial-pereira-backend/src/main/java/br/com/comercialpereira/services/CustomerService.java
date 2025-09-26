package br.com.comercialpereira.services;

import br.com.comercialpereira.dto.PageResponse;
import br.com.comercialpereira.dto.customer.CreateCustomerRequest;
import br.com.comercialpereira.dto.customer.CustomerResponse;
import br.com.comercialpereira.dto.customer.UpdateCustomerRequest;
import br.com.comercialpereira.entity.Customer;
import br.com.comercialpereira.enums.CustomerType;
import br.com.comercialpereira.exception.ApiException;
import br.com.comercialpereira.repository.CustomerRepository;
import br.com.comercialpereira.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;

    /**
     * Lista todos os clientes com base nos filtros fornecidos, de forma paginada.
     */
    @Transactional(readOnly = true)
    public PageResponse<CustomerResponse> findAll(String search, CustomerType type, String city, String state, Boolean isActive, Pageable pageable) {
        Page<Customer> customerPage = customerRepository.findByFilters(search, type, city, state, isActive, pageable);
        Page<CustomerResponse> customerResponsePage = customerPage.map(this::toCustomerResponse);
        return PageResponse.from(customerResponsePage);
    }

    /**
     * Busca um cliente pelo seu ID.
     */
    @Transactional(readOnly = true)
    public CustomerResponse findById(Long id) {
        Customer customer = findCustomerByIdOrThrow(id);
        return toCustomerResponse(customer);
    }

    /**
     * Cria um novo cliente após validar os dados.
     */
    @Transactional
    public CustomerResponse create(CreateCustomerRequest request) {
        // Valida se email e documento já existem
        if (request.getEmail() != null && customerRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email já está em uso por outro cliente.");
        }
        if (request.getDocument() != null && customerRepository.existsByDocument(request.getDocument())) {
            throw new ApiException(HttpStatus.CONFLICT, "Documento já está em uso por outro cliente.");
        }

        Customer customer = toCustomerEntity(request);
        Customer savedCustomer = customerRepository.save(customer);

        return toCustomerResponse(savedCustomer);
    }

    /**
     * Atualiza um cliente existente.
     */
    @Transactional
    public CustomerResponse update(Long id, UpdateCustomerRequest request) {
        Customer existingCustomer = findCustomerByIdOrThrow(id);

        // Valida se o novo email já pertence a OUTRO cliente
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(existingCustomer.getEmail())) {
            if (customerRepository.existsByEmail(request.getEmail())) {
                throw new ApiException(HttpStatus.CONFLICT, "Email já está em uso por outro cliente.");
            }
            existingCustomer.setEmail(request.getEmail());
        }

        // Valida se o novo documento já pertence a OUTRO cliente
        if (request.getDocument() != null && !request.getDocument().equals(existingCustomer.getDocument())) {
            if (customerRepository.existsByDocument(request.getDocument())) {
                throw new ApiException(HttpStatus.CONFLICT, "Documento já está em uso por outro cliente.");
            }
            existingCustomer.setDocument(request.getDocument());
        }

        // Atualiza os outros campos se foram fornecidos
        if (request.getName() != null) existingCustomer.setName(request.getName());
        if (request.getPhone() != null) existingCustomer.setPhone(request.getPhone());
        if (request.getAddress() != null) existingCustomer.setAddress(request.getAddress());
        if (request.getNeighborhood() != null) existingCustomer.setNeighborhood(request.getNeighborhood());
        if (request.getCity() != null) existingCustomer.setCity(request.getCity());
        if (request.getState() != null) existingCustomer.setState(request.getState());
        if (request.getZipCode() != null) existingCustomer.setZipCode(request.getZipCode());
        if (request.getType() != null) existingCustomer.setType(request.getType());
        if (request.getIsActive() != null) existingCustomer.setIsActive(request.getIsActive());

        Customer updatedCustomer = customerRepository.save(existingCustomer);
        return toCustomerResponse(updatedCustomer);
    }

    /**
     * Exclui um cliente.
     * Se o cliente tiver vendas, ele é apenas desativado (soft delete).
     * Se não tiver vendas, ele é removido do banco (hard delete).
     */
    @Transactional
    public Map<String, Object> delete(Long id) {
        Customer customer = findCustomerByIdOrThrow(id);
        Map<String, Object> response = new HashMap<>();

        // Para esta lógica funcionar, você precisa ter um SaleRepository com o método countByCustomerId
        boolean hasSales = saleRepository.countByCustomerId(id) > 0;

        if (hasSales) {
            // Soft delete
            customer.setIsActive(false);
            customerRepository.save(customer);
            response.put("message", "Cliente desativado com sucesso (possui histórico de vendas).");
            response.put("id", customer.getId());
            response.put("isActive", customer.getIsActive());
        } else {
            // Hard delete
            customerRepository.delete(customer);
            response.put("message", "Cliente deletado com sucesso.");
            response.put("id", customer.getId());
        }
        return response;
    }


    // --- MÉTODOS AUXILIARES ---

    /**
     * Busca um Customer por ID ou lança uma exceção se não encontrado.
     */
    private Customer findCustomerByIdOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Cliente com ID " + id + " não encontrado."));
    }

    /**
     * Mapeia um CreateCustomerRequest DTO para a entidade Customer.
     */
    private Customer toCustomerEntity(CreateCustomerRequest request) {
        return Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .neighborhood(request.getNeighborhood())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .document(request.getDocument())
                .type(request.getType())
                .isActive(request.getIsActive())
                .build();
    }

    /**
     * Mapeia a entidade Customer para o DTO de resposta CustomerResponse.
     */
    private CustomerResponse toCustomerResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .address(customer.getAddress())
                .neighborhood(customer.getNeighborhood())
                .city(customer.getCity())
                .state(customer.getState())
                .zipCode(customer.getZipCode())
                .document(customer.getDocument())
                .type(customer.getType())
                .isActive(customer.getIsActive())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                // Lógica para campos calculados (exemplo)
                .fullAddress(formatFullAddress(customer))
                .formattedDocument(formatDocument(customer.getDocument(), customer.getType()))
                .build();
    }

    private String formatFullAddress(Customer customer) {
        // Exemplo simples de formatação de endereço completo
        return String.format("%s, %s, %s - %s, %s",
                customer.getAddress() != null ? customer.getAddress() : "",
                customer.getNeighborhood() != null ? customer.getNeighborhood() : "",
                customer.getCity() != null ? customer.getCity() : "",
                customer.getState() != null ? customer.getState() : "",
                customer.getZipCode() != null ? customer.getZipCode() : ""
        ).replaceAll(", ,", ",").trim();
    }

    private String formatDocument(String document, CustomerType type) {
        if (document == null || document.isEmpty()) {
            return null;
        }
        // Lógica de formatação de CPF/CNPJ (simplificada)
        if (type == CustomerType.RETAIL && document.length() == 11) {
            return document.replaceFirst("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
        }
        if (type == CustomerType.WHOLESALE && document.length() == 14) {
            return document.replaceFirst("(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})", "$1.$2.$3/$4-$5");
        }
        return document;
    }
}