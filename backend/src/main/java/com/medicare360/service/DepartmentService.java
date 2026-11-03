package com.medicare360.service;

import com.medicare360.dto.DepartmentCreateRequest;
import com.medicare360.dto.DepartmentResponse;
import com.medicare360.dto.DepartmentUpdateRequest;
import com.medicare360.entity.Department;
import com.medicare360.entity.User;
import com.medicare360.exception.BadRequestException;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.DepartmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final AuditService auditService;

    public DepartmentService(DepartmentRepository departmentRepository, AuditService auditService) {
        this.departmentRepository = departmentRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getMulti(int skip, int limit, Boolean isActive) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        Page<Department> departments = departmentRepository.findAll(pageable);
        return departments.getContent().stream()
                .filter(d -> isActive == null || d.isActive() == isActive)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        return toResponse(dept);
    }

    @Transactional
    public DepartmentResponse create(DepartmentCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        boolean exists = departmentRepository.findAll().stream()
                .anyMatch(d -> d.getName().equalsIgnoreCase(req.getName()));
        if (exists) {
            throw new BadRequestException("Department '" + req.getName() + "' already exists.");
        }

        Department dept = new Department();
        dept.setName(req.getName());
        dept.setDescription(req.getDescription());
        dept.setHeadOfDepartment(req.getHeadOfDepartment());

        if (req.getCode() != null && !req.getCode().isBlank()) {
            dept.setCode(req.getCode());
        } else {
            String cleanName = req.getName().replaceAll("[^A-Za-z0-9]", "").toUpperCase();
            dept.setCode(cleanName.length() >= 6 ? cleanName.substring(0, 6) : (cleanName.isEmpty() ? "DEPT" : cleanName));
        }

        if (req.getStatus() != null) {
            dept.setStatus(req.getStatus());
            dept.setActive("Active".equalsIgnoreCase(req.getStatus()));
        } else {
            dept.setStatus("Active");
            dept.setActive(true);
        }

        dept = departmentRepository.save(dept);

        auditService.logAction(
                "DEPARTMENT_CREATED",
                "Department",
                currentUser,
                dept.getId().toString(),
                Map.of("name", dept.getName(), "code", dept.getCode()),
                ipAddress,
                userAgent
        );

        return toResponse(dept);
    }

    @Transactional
    public DepartmentResponse update(Long id, DepartmentUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (req.getName() != null) dept.setName(req.getName());
        if (req.getCode() != null) dept.setCode(req.getCode());
        if (req.getDescription() != null) dept.setDescription(req.getDescription());
        if (req.getHeadOfDepartment() != null) dept.setHeadOfDepartment(req.getHeadOfDepartment());
        if (req.getStatus() != null) {
            dept.setStatus(req.getStatus());
            dept.setActive("Active".equalsIgnoreCase(req.getStatus()));
        }
        if (req.getIsActive() != null) {
            dept.setActive(req.getIsActive());
            dept.setStatus(req.getIsActive() ? "Active" : "Inactive");
        }

        dept = departmentRepository.save(dept);

        auditService.logAction(
                "DEPARTMENT_UPDATED",
                "Department",
                currentUser,
                dept.getId().toString(),
                Map.of("id", dept.getId()),
                ipAddress,
                userAgent
        );

        return toResponse(dept);
    }

    public DepartmentResponse toResponse(Department d) {
        DepartmentResponse res = new DepartmentResponse();
        res.setId(d.getId());
        res.setCode(d.getCode());
        res.setName(d.getName());
        res.setDescription(d.getDescription());
        res.setHeadOfDepartment(d.getHeadOfDepartment());
        res.setStatus(d.getStatus());
        res.setActive(d.isActive());
        res.setCreatedAt(d.getCreatedAt());
        res.setUpdatedAt(d.getUpdatedAt());
        return res;
    }
}

