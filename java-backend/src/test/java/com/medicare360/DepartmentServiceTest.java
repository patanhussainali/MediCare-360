package com.medicare360;

import com.medicare360.dto.DepartmentCreateRequest;
import com.medicare360.dto.DepartmentResponse;
import com.medicare360.dto.DepartmentUpdateRequest;
import com.medicare360.entity.Department;
import com.medicare360.entity.User;
import com.medicare360.exception.BadRequestException;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.DepartmentRepository;
import com.medicare360.service.AuditService;
import com.medicare360.service.DepartmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock private DepartmentRepository departmentRepository;
    @Mock private AuditService auditService;

    @InjectMocks
    private DepartmentService departmentService;

    private Department cardiology;

    @BeforeEach
    void setUp() {
        cardiology = new Department();
        cardiology.setId(1L);
        cardiology.setName("Cardiology");
        cardiology.setCode("CARDIO");
        cardiology.setActive(true);
        cardiology.setStatus("Active");
    }

    @Test
    void testGetMulti() {
        when(departmentRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(cardiology)));

        List<DepartmentResponse> list = departmentService.getMulti(0, 50, true);
        assertEquals(1, list.size());
        assertEquals("Cardiology", list.get(0).getName());
    }

    @Test
    void testGetById_Found() {
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(cardiology));

        DepartmentResponse res = departmentService.getById(1L);
        assertNotNull(res);
        assertEquals("CARDIO", res.getCode());
    }

    @Test
    void testGetById_NotFound() {
        when(departmentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> departmentService.getById(99L));
    }

    @Test
    void testCreateDepartment_Success() {
        when(departmentRepository.findAll()).thenReturn(List.of());
        when(departmentRepository.save(any(Department.class))).thenAnswer(inv -> {
            Department d = inv.getArgument(0);
            d.setId(2L);
            return d;
        });

        DepartmentCreateRequest req = new DepartmentCreateRequest();
        req.setName("Neurology");
        req.setDescription("Brain and nerve care");

        DepartmentResponse res = departmentService.create(req, new User(), "127.0.0.1", "Mozilla");
        assertNotNull(res);
        assertEquals("Neurology", res.getName());
        assertEquals("NEUROL", res.getCode());
    }

    @Test
    void testCreateDepartment_DuplicateName() {
        when(departmentRepository.findAll()).thenReturn(List.of(cardiology));

        DepartmentCreateRequest req = new DepartmentCreateRequest();
        req.setName("Cardiology");

        assertThrows(BadRequestException.class, () -> departmentService.create(req, new User(), "127.0.0.1", "Mozilla"));
    }
}

