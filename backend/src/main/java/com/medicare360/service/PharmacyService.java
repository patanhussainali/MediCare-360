package com.medicare360.service;

import com.medicare360.dto.*;
import com.medicare360.entity.*;
import com.medicare360.exception.BadRequestException;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.MedicineIssueRecordRepository;
import com.medicare360.repository.MedicineRepository;
import com.medicare360.repository.PatientRepository;
import com.medicare360.repository.PrescriptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class PharmacyService {

    private final MedicineRepository medicineRepository;
    private final MedicineIssueRecordRepository medicineIssueRecordRepository;
    private final PatientRepository patientRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final AuditService auditService;

    public PharmacyService(MedicineRepository medicineRepository,
                           MedicineIssueRecordRepository medicineIssueRecordRepository,
                           PatientRepository patientRepository,
                           PrescriptionRepository prescriptionRepository,
                           AuditService auditService) {
        this.medicineRepository = medicineRepository;
        this.medicineIssueRecordRepository = medicineIssueRecordRepository;
        this.patientRepository = patientRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.auditService = auditService;
    }

    public List<MedicineResponse> getMedicines(int skip, int limit, String search, String category) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());

        Page<Medicine> medicines = medicineRepository.findAll(pageable);
        return medicines.getContent().stream()
                .filter(m -> search == null || search.isBlank() ||
                        m.getName().toLowerCase().contains(search.toLowerCase()) ||
                        (m.getGenericName() != null && m.getGenericName().toLowerCase().contains(search.toLowerCase())))
                .filter(m -> category == null || category.isBlank() ||
                        (m.getCategory() != null && m.getCategory().toLowerCase().contains(category.toLowerCase())))
                .map(this::toResponse)
                .toList();
    }

    public List<MedicineResponse> getLowStockMedicines() {
        return medicineRepository.findAll().stream()
                .filter(m -> m.getStockQuantity() <= m.getMinStockThreshold())
                .map(this::toResponse)
                .toList();
    }

    public MedicineResponse getMedicineById(String id) {
        Medicine m = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));
        return toResponse(m);
    }

    public MedicineResponse createMedicine(MedicineCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        if (medicineRepository.findByName(req.getName()).isPresent()) {
            throw new BadRequestException("Medicine '" + req.getName() + "' already exists.");
        }

        Medicine m = new Medicine();
        String code = (req.getCode() != null && !req.getCode().isBlank())
                ? req.getCode()
                : "MED-" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        m.setCode(code);
        m.setName(req.getName());
        m.setGenericName(req.getGenericName());
        m.setCategory(req.getCategory());
        m.setManufacturer(req.getManufacturer());
        m.setUnitPrice(req.getUnitPrice() != null ? req.getUnitPrice() : 0.0);
        m.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0);
        m.setMinStockThreshold(req.getMinStockThreshold() != null ? req.getMinStockThreshold() : 10);
        m.setExpiryDate(req.getExpiryDate());
        m.setStatus(m.getStockQuantity() > 0 ? "Available" : "Out of Stock");

        m = medicineRepository.save(m);
        auditService.logAction("MEDICINE_CREATED", "Medicine", currentUser, m.getId(),
                Map.of("name", m.getName(), "stock", m.getStockQuantity()), ipAddress, userAgent);
        return toResponse(m);
    }

    public MedicineResponse updateMedicine(String id, MedicineUpdateRequest req, User currentUser, String ipAddress, String userAgent) {
        Medicine m = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));

        if (req.getName() != null) m.setName(req.getName());
        if (req.getGenericName() != null) m.setGenericName(req.getGenericName());
        if (req.getCode() != null) m.setCode(req.getCode());
        if (req.getCategory() != null) m.setCategory(req.getCategory());
        if (req.getManufacturer() != null) m.setManufacturer(req.getManufacturer());
        if (req.getUnitPrice() != null) m.setUnitPrice(req.getUnitPrice());
        if (req.getStockQuantity() != null) {
            m.setStockQuantity(req.getStockQuantity());
            m.setStatus(m.getStockQuantity() > 0 ? "Available" : "Out of Stock");
        }
        if (req.getMinStockThreshold() != null) m.setMinStockThreshold(req.getMinStockThreshold());
        if (req.getExpiryDate() != null) m.setExpiryDate(req.getExpiryDate());
        if (req.getStatus() != null) m.setStatus(req.getStatus());

        m = medicineRepository.save(m);
        auditService.logAction("MEDICINE_UPDATED", "Medicine", currentUser, m.getId(),
                Map.of("id", m.getId()), ipAddress, userAgent);
        return toResponse(m);
    }

    public MedicineResponse updateStock(String id, int quantityDelta, User currentUser, String ipAddress, String userAgent) {
        Medicine m = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));

        int newStock = m.getStockQuantity() + quantityDelta;
        if (newStock < 0) {
            throw new BadRequestException("Insufficient stock for '" + m.getName() + "'. Available: " + m.getStockQuantity() + ", requested change: " + quantityDelta);
        }
        m.setStockQuantity(newStock);
        m.setStatus(newStock > 0 ? "Available" : "Out of Stock");
        m = medicineRepository.save(m);

        auditService.logAction("MEDICINE_STOCK_UPDATED", "Medicine", currentUser, m.getId(),
                Map.of("delta", quantityDelta, "new_stock", m.getStockQuantity()), ipAddress, userAgent);
        return toResponse(m);
    }

    public MedicineIssueResponse issueMedicine(MedicineIssueCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        Medicine m = medicineRepository.findById(req.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found"));
        Patient p = patientRepository.findById(req.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));

        if (m.getStockQuantity() < req.getQuantity()) {
            throw new BadRequestException("Cannot issue " + req.getQuantity() + " units. Only " + m.getStockQuantity() + " in stock.");
        }

        m.setStockQuantity(m.getStockQuantity() - req.getQuantity());
        m.setStatus(m.getStockQuantity() > 0 ? "Available" : "Out of Stock");
        medicineRepository.save(m);

        MedicineIssueRecord record = new MedicineIssueRecord();
        record.setMedicineId(m.getId());
        record.setMedicineName(m.getName());
        record.setPatientId(p.getId());
        record.setPatientName(p.getFullName());

        if (req.getPrescriptionId() != null && !req.getPrescriptionId().isBlank()) {
            prescriptionRepository.findById(req.getPrescriptionId())
                    .ifPresent(presc -> record.setPrescriptionId(presc.getId()));
        }

        record.setQuantity(req.getQuantity());
        record.setDispensedBy(currentUser != null ? currentUser.getFullName() : "Pharmacist");
        record.setDispensedAt(Instant.now());
        record.setNotes(req.getNotes());

        medicineIssueRecordRepository.save(record);
        auditService.logAction("MEDICINE_ISSUED", "MedicineIssueRecord", currentUser, record.getId(),
                Map.of("medicine_id", m.getId(), "quantity", req.getQuantity()), ipAddress, userAgent);
        return toIssueResponse(record);
    }

    public List<MedicineIssueResponse> getIssueRecords(int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return medicineIssueRecordRepository.findAll(pageable).getContent().stream().map(this::toIssueResponse).toList();
    }

    public MedicineResponse toResponse(Medicine m) {
        MedicineResponse res = new MedicineResponse();
        res.setId(m.getId());
        res.setCode(m.getCode());
        res.setName(m.getName());
        res.setGenericName(m.getGenericName());
        res.setCategory(m.getCategory());
        res.setManufacturer(m.getManufacturer());
        res.setUnitPrice(m.getUnitPrice());
        res.setStockQuantity(m.getStockQuantity());
        res.setMinStockThreshold(m.getMinStockThreshold());
        res.setExpiryDate(m.getExpiryDate());
        res.setStatus(m.getStatus());
        res.setCreatedAt(m.getCreatedAt());
        res.setUpdatedAt(m.getUpdatedAt());
        return res;
    }

    public MedicineIssueResponse toIssueResponse(MedicineIssueRecord r) {
        MedicineIssueResponse res = new MedicineIssueResponse();
        res.setId(r.getId());
        res.setMedicineId(r.getMedicineId());
        res.setMedicineName(r.getMedicineName());
        res.setPatientId(r.getPatientId());
        res.setPatientName(r.getPatientName());
        res.setPrescriptionId(r.getPrescriptionId());
        res.setQuantity(r.getQuantity());
        res.setDispensedBy(r.getDispensedBy());
        res.setDispensedAt(r.getDispensedAt());
        res.setNotes(r.getNotes());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }
}
