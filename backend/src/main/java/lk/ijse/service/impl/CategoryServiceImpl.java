package lk.ijse.service.impl;

import lk.ijse.dto.CategoryDTO;
import lk.ijse.entity.Category;
import lk.ijse.entity.Course;
import lk.ijse.repository.CategoryRepo;
import lk.ijse.repository.CourseRepo;
import lk.ijse.service.CategoryService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private CourseRepo courseRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepo.findAll();
        return categories.stream()
                .map(category -> modelMapper.map(category, CategoryDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryDTO.getName() == null || categoryDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }

        Category category = modelMapper.map(categoryDTO, Category.class);
        Category savedCategory = categoryRepo.save(category);
        return modelMapper.map(savedCategory, CategoryDTO.class);
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category existingCategory = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

        if (categoryDTO.getName() == null || categoryDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }

        existingCategory.setName(categoryDTO.getName());
        Category updatedCategory = categoryRepo.save(existingCategory);
        return modelMapper.map(updatedCategory, CategoryDTO.class);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + id));

        List<Course> courses = courseRepo.findByCategory(category);
        if (courses != null && !courses.isEmpty()) {
            throw new IllegalStateException("Cannot delete category with associated courses");
        }

        categoryRepo.delete(category);
    }
}
