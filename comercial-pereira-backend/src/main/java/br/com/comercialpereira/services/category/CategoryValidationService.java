package br.com.comercialpereira.services.category;

import br.com.comercialpereira.dto.category.CreateCategoryRequest;
import br.com.comercialpereira.dto.category.UpdateCategoryRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class CategoryValidationService {

    private static final Pattern CNAE_PATTERN = Pattern.compile("^\\d{2}\\.\\d{2}-\\d-\\d{2}$");

    public List<String> validateCreateCategoryBusinessRules(CreateCategoryRequest request) {
        List<String> errors = new ArrayList<>();

        // Validar CNAE se fornecido
        if (request.getCnae() != null && !request.getCnae().isEmpty()) {
            if (!isValidCnae(request.getCnae())) {
                errors.add("CNAE deve seguir o padrão XX.XX-X-XX");
            }
        }

        // Validar nome não vazio após trim
        if (request.getName() != null && request.getName().trim().isEmpty()) {
            errors.add("Nome não pode ser apenas espaços em branco");
        }

        return errors;
    }

    public List<String> validateUpdateCategoryBusinessRules(UpdateCategoryRequest request) {
        List<String> errors = new ArrayList<>();

        // Validar CNAE se fornecido
        if (request.getCnae() != null && !request.getCnae().isEmpty()) {
            if (!isValidCnae(request.getCnae())) {
                errors.add("CNAE deve seguir o padrão XX.XX-X-XX");
            }
        }

        // Validar nome não vazio após trim se fornecido
        if (request.getName() != null && request.getName().trim().isEmpty()) {
            errors.add("Nome não pode ser apenas espaços em branco");
        }

        return errors;
    }

    private boolean isValidCnae(String cnae) {
        return cnae != null && CNAE_PATTERN.matcher(cnae).matches();
    }

    public boolean isValidCategoryName(String name) {
        return name != null &&
                !name.trim().isEmpty() &&
                name.trim().length() <= 100;
    }

    public boolean isValidDescription(String description) {
        return description == null || description.length() <= 500;
    }
}