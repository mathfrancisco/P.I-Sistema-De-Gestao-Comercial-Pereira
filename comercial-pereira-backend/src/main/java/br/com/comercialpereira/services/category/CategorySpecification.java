package br.com.comercialpereira.services.category;

import br.com.comercialpereira.entity.Category;
import br.com.comercialpereira.dto.category.CategoryFilters;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class CategorySpecification {

    public static Specification<Category> withFilters(CategoryFilters filters) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filtro de busca por nome ou descrição
            if (filters.getSearch() != null && !filters.getSearch().trim().isEmpty()) {
                String searchTerm = "%" + filters.getSearch().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")), searchTerm);
                Predicate descriptionPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")), searchTerm);
                predicates.add(criteriaBuilder.or(namePredicate, descriptionPredicate));
            }

            // Filtro por status ativo/inativo
            if (filters.getIsActive() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isActive"), filters.getIsActive()));
            }

            // Filtro por ter CNAE ou não
            if (filters.getHasCnae() != null) {
                if (filters.getHasCnae()) {
                    predicates.add(criteriaBuilder.isNotNull(root.get("cnae")));
                } else {
                    predicates.add(criteriaBuilder.isNull(root.get("cnae")));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}