package br.com.comercialpereira.dto.customer;

import br.com.comercialpereira.enums.CustomerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String neighborhood;
    private String city;
    private String state;
    private String zipCode;
    private String document;
    private CustomerType type;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Campos calculados
    private String fullAddress;
    private String formattedDocument;
}