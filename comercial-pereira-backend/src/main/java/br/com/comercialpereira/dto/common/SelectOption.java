package br.com.comercialpereira.dto.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SelectOption {
    private Object value;
    private String label;
    private String description;
    private Boolean disabled;

    public static SelectOption of(Object value, String label) {
        return SelectOption.builder()
                .value(value)
                .label(label)
                .build();
    }
}