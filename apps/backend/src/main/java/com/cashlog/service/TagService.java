package com.cashlog.service;

import com.cashlog.dto.request.CreateTagRequest;
import com.cashlog.dto.response.TagDTO;
import com.cashlog.entity.Tag;
import com.cashlog.exception.ResourceNotFoundException;
import com.cashlog.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {
    
    private final TagRepository tagRepository;
    
    @Transactional
    public TagDTO createTag(CreateTagRequest request) {
        if (tagRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Tag already exists: " + request.getName());
        }
        
        Tag tag = Tag.builder()
                .name(request.getName())
                .color(request.getColor())
                .build();
        
        Tag saved = tagRepository.save(tag);
        return toDTO(saved);
    }
    
    public List<TagDTO> getAllTags() {
        return tagRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TagDTO updateTag(Long id, CreateTagRequest request) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found: " + id));
        
        tag.setName(request.getName());
        tag.setColor(request.getColor());
        
        Tag updated = tagRepository.save(tag);
        return toDTO(updated);
    }
    
    @Transactional
    public void deleteTag(Long id) {
        if (!tagRepository.existsById(id)) {
            throw new ResourceNotFoundException("Tag not found: " + id);
        }
        tagRepository.deleteById(id);
    }
    
    private TagDTO toDTO(Tag tag) {
        return TagDTO.builder()
                .id(tag.getId())
                .name(tag.getName())
                .color(tag.getColor())
                .createdAt(tag.getCreatedAt())
                .build();
    }
}
