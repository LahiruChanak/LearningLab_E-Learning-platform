package lk.ijse.controller;

import lk.ijse.dto.CategoryDTO;
import lk.ijse.dto.ResponseDTO;
import lk.ijse.entity.Category;
import lk.ijse.repository.CategoryRepo;
import lk.ijse.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/category")
    public ResponseEntity<ResponseDTO> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(new ResponseDTO(200, "Categories fetched successfully", categories));
    }

    @PostMapping("/admin/category")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO> addCategory(@RequestBody CategoryDTO categoryDTO) {
        try {
            CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
            return ResponseEntity.ok(new ResponseDTO(200, "Category added successfully", createdCategory));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        }
    }

    @PutMapping("/admin/category/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO) {
        try {
            CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO);
            return ResponseEntity.ok(new ResponseDTO(200, "Category updated successfully", updatedCategory));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(404, e.getMessage(), null));
        }
    }

    @DeleteMapping("/admin/category/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResponseDTO> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(new ResponseDTO(200, "Category deleted successfully", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ResponseDTO(400, e.getMessage(), null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseDTO(404, e.getMessage(), null));
        }
    }
}
