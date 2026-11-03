package com.medicare360.controller;

import com.medicare360.common.RoleAssignments;
import com.medicare360.dto.DepartmentCreateRequest;
import com.medicare360.dto.DepartmentResponse;
import com.medicare360.dto.DepartmentUpdateRequest;
import com.medicare360.entity.User;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.UserPrincipal;
import com.medicare360.service.DepartmentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/departments")
public class DepartmentController {

    private final DepartmentService departmentService;
    private final UserRepository userRepository;

    public DepartmentController(DepartmentService departmentService, UserRepository userRepository) {
        this.departmentService = departmentService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DepartmentResponse> createDepartment(
            @Valid @RequestBody DepartmentCreateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        DepartmentResponse res = departmentService.create(req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent"));
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    @GetMapping("/role-assignments")
    public ResponseEntity<Map<String, List<String>>> getRoleAssignments() {
        return ResponseEntity.ok(RoleAssignments.getAllRoleAssignments());
    }

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> listDepartments(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "100") int limit,
            @RequestParam(value = "is_active", required = false) Boolean isActive
    ) {
        return ResponseEntity.ok(departmentService.getMulti(skip, limit, isActive));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getDepartment(@PathVariable("id") Long id) {
        return ResponseEntity.ok(departmentService.getById(id));
    }

    @RequestMapping(value = "/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<DepartmentResponse> updateDepartment(
            @PathVariable("id") Long id,
            @RequestBody DepartmentUpdateRequest req,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest request
    ) {
        User currentUser = principal != null ? userRepository.findById(principal.getUserId()).orElse(null) : null;
        return ResponseEntity.ok(departmentService.update(id, req, currentUser, request.getRemoteAddr(), request.getHeader("User-Agent")));
    }
}

