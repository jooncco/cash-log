package com.cashlog.mapper;

import com.cashlog.dto.response.CategoryDTO;
import com.cashlog.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    
    public CategoryDTO toDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .color(category.getColor())
                .build();
    }
}
