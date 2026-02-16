package com.cashlog.controller;

import com.cashlog.dto.request.CreateTagRequest;
import com.cashlog.dto.response.TagDTO;
import com.cashlog.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Tag(name = "Tag", description = "Tag management APIs")
public class TagController {
    
    private final TagService tagService;
    
    @PostMapping
    @Operation(summary = "Create a new tag")
    public ResponseEntity<TagDTO> createTag(@Valid @RequestBody CreateTagRequest request) {
        TagDTO created = tagService.createTag(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @GetMapping
    @Operation(summary = "Get all tags")
    public ResponseEntity<List<TagDTO>> getAllTags() {
        List<TagDTO> tags = tagService.getAllTags();
        return ResponseEntity.ok(tags);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tag")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
