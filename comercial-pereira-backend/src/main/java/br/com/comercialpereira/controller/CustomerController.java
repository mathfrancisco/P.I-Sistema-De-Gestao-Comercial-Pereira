package br.com.comercialpereira.controller;

import br.com.comercialpereira.dto.PageResponse;
import br.com.comercialpereira.dto.customer.CreateCustomerRequest;
import br.com.comercialpereira.dto.customer.CustomerResponse;
import br.com.comercialpereira.dto.customer.UpdateCustomerRequest;
import br.com.comercialpereira.enums.CustomerType;
import br.com.comercialpereira.services.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /**
     * Endpoint para listar clientes com filtros e paginação.
     * Exemplo: GET /api/customers?search=João&state=SP&page=0&size=10&sort=name,asc
     */
    @GetMapping
    public ResponseEntity<PageResponse<CustomerResponse>> getAllCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CustomerType type,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String state,
            @RequestParam(required = false, defaultValue = "true") Boolean isActive,
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {

        PageResponse<CustomerResponse> response = customerService.findAll(search, type, city, state, isActive, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para buscar um cliente pelo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CustomerResponse> getCustomerById(@PathVariable Long id) {
        CustomerResponse customer = customerService.findById(id);
        return ResponseEntity.ok(customer);
    }

    /**
     * Endpoint para criar um novo cliente.
     */
    @PostMapping
    public ResponseEntity<CustomerResponse> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        CustomerResponse createdCustomer = customerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCustomer);
    }

    /**
     * Endpoint para atualizar um cliente existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CustomerResponse> updateCustomer(@PathVariable Long id, @Valid @RequestBody UpdateCustomerRequest request) {
        CustomerResponse updatedCustomer = customerService.update(id, request);
        return ResponseEntity.ok(updatedCustomer);
    }

    /**
     * Endpoint para deletar/desativar um cliente.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCustomer(@PathVariable Long id) {
        Map<String, Object> response = customerService.delete(id);
        return ResponseEntity.ok(response);
    }
}