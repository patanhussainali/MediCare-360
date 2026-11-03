package com.medicare360.service;

import com.medicare360.dto.*;
import com.medicare360.entity.*;
import com.medicare360.exception.BadRequestException;
import com.medicare360.exception.ResourceNotFoundException;
import com.medicare360.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class StaffService {

    private final NurseRepository nurseRepository;
    private final ReceptionistRepository receptionistRepository;
    private final PharmacistRepository pharmacistRepository;
    private final StaffScheduleRepository staffScheduleRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final UserCodeGenerator userCodeGenerator;

    public StaffService(NurseRepository nurseRepository, ReceptionistRepository receptionistRepository,
                        PharmacistRepository pharmacistRepository, StaffScheduleRepository staffScheduleRepository,
                        UserRepository userRepository, DepartmentRepository departmentRepository,
                        PasswordEncoder passwordEncoder, AuditService auditService, UserCodeGenerator userCodeGenerator) {
        this.nurseRepository = nurseRepository;
        this.receptionistRepository = receptionistRepository;
        this.pharmacistRepository = pharmacistRepository;
        this.staffScheduleRepository = staffScheduleRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.userCodeGenerator = userCodeGenerator;
    }

    // --- NURSES ---
    public List<NurseResponse> getNurses(int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        return nurseRepository.findAll(PageRequest.of(page, size)).getContent().stream().map(this::toNurseResponse).toList();
    }

    public NurseResponse getNurseById(String id) {
        return toNurseResponse(nurseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse not found")));
    }

    public NurseResponse createNurse(NurseCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' is already registered in the system.");
        }

        String password = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword() : UUID.randomUUID().toString().substring(0, 12);

        User user = new User();
        user.setUserCode(userCodeGenerator.nextCode());
        user.setEmail(cleanEmail);
        user.setHashedPassword(passwordEncoder.encode(password));
        user.setFullName(req.getFullName());
        user.setRole(UserRole.NURSE);
        user.setPhone(req.getPhone());
        user.setActive(true);
        user.setVerified(true);
        user = userRepository.save(user);

        Nurse nurse = new Nurse();
        nurse.setNurseId("NUR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        nurse.setUserId(user.getId());
        nurse.setFullName(req.getFullName());
        nurse.setLicenseNumber(req.getLicenseNumber());
        nurse.setShift(req.getShift() != null ? req.getShift() : "Morning");
        nurse.setPhone(req.getPhone());
        nurse.setEmail(cleanEmail);
        nurse.setStatus(req.getStatus() != null ? req.getStatus() : "Active");

        if (req.getDepartmentId() != null && !req.getDepartmentId().isBlank()) {
            departmentRepository.findById(req.getDepartmentId())
                    .ifPresent(dept -> nurse.setDepartmentId(dept.getId()));
        }

        nurseRepository.save(nurse);
        auditService.logAction("NURSE_CREATED", "Nurse", currentUser, nurse.getId(),
                Map.of("email", nurse.getEmail()), ipAddress, userAgent);
        return toNurseResponse(nurse);
    }

    // --- RECEPTIONISTS ---
    public List<ReceptionistResponse> getReceptionists(int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        return receptionistRepository.findAll(PageRequest.of(page, size)).getContent().stream().map(this::toReceptionistResponse).toList();
    }

    public ReceptionistResponse getReceptionistById(String id) {
        return toReceptionistResponse(receptionistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found")));
    }

    public ReceptionistResponse createReceptionist(ReceptionistCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' is already registered in the system.");
        }

        String password = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword() : UUID.randomUUID().toString().substring(0, 12);

        User user = new User();
        user.setUserCode(userCodeGenerator.nextCode());
        user.setEmail(cleanEmail);
        user.setHashedPassword(passwordEncoder.encode(password));
        user.setFullName(req.getFullName());
        user.setRole(UserRole.RECEPTIONIST);
        user.setPhone(req.getPhone());
        user.setActive(true);
        user.setVerified(true);
        user = userRepository.save(user);

        Receptionist rec = new Receptionist();
        rec.setReceptionistId("REC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        rec.setUserId(user.getId());
        rec.setFullName(req.getFullName());
        rec.setShift(req.getShift() != null ? req.getShift() : "Day");
        rec.setPhone(req.getPhone());
        rec.setEmail(cleanEmail);
        rec.setStatus(req.getStatus() != null ? req.getStatus() : "Active");

        receptionistRepository.save(rec);
        auditService.logAction("RECEPTIONIST_CREATED", "Receptionist", currentUser, rec.getId(),
                Map.of("email", rec.getEmail()), ipAddress, userAgent);
        return toReceptionistResponse(rec);
    }

    // --- PHARMACISTS ---
    public List<PharmacistResponse> getPharmacists(int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        return pharmacistRepository.findAll(PageRequest.of(page, size)).getContent().stream().map(this::toPharmacistResponse).toList();
    }

    public PharmacistResponse getPharmacistById(String id) {
        return toPharmacistResponse(pharmacistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacist not found")));
    }

    public PharmacistResponse createPharmacist(PharmacistCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' is already registered in the system.");
        }

        String password = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword() : UUID.randomUUID().toString().substring(0, 12);

        User user = new User();
        user.setUserCode(userCodeGenerator.nextCode());
        user.setEmail(cleanEmail);
        user.setHashedPassword(passwordEncoder.encode(password));
        user.setFullName(req.getFullName());
        user.setRole(UserRole.PHARMACIST);
        user.setPhone(req.getPhone());
        user.setActive(true);
        user.setVerified(true);
        user = userRepository.save(user);

        Pharmacist ph = new Pharmacist();
        ph.setPharmacistId("PHAR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase());
        ph.setUserId(user.getId());
        ph.setFullName(req.getFullName());
        ph.setLicenseNumber(req.getLicenseNumber());
        ph.setPhone(req.getPhone());
        ph.setEmail(cleanEmail);
        ph.setStatus(req.getStatus() != null ? req.getStatus() : "Active");

        pharmacistRepository.save(ph);
        auditService.logAction("PHARMACIST_CREATED", "Pharmacist", currentUser, ph.getId(),
                Map.of("email", ph.getEmail()), ipAddress, userAgent);
        return toPharmacistResponse(ph);
    }

    // --- SCHEDULES ---
    public List<StaffScheduleResponse> getSchedules(int skip, int limit, String staffType, String dayOfWeek) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<StaffSchedule> schedules = staffScheduleRepository.findAll(pageable);
        return schedules.getContent().stream()
                .filter(s -> staffType == null || s.getStaffType().equalsIgnoreCase(staffType))
                .filter(s -> dayOfWeek == null || s.getDayOfWeek().equalsIgnoreCase(dayOfWeek))
                .map(this::toScheduleResponse)
                .toList();
    }

    public StaffScheduleResponse createSchedule(StaffScheduleCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        StaffSchedule sched = new StaffSchedule();
        sched.setStaffType(req.getStaffType());
        int parsedStaffId = 0;
        try {
            if (req.getStaffId() != null && !req.getStaffId().isBlank()) {
                parsedStaffId = Integer.parseInt(req.getStaffId());
            }
        } catch (NumberFormatException ignored) {}
        sched.setStaffId(String.valueOf(parsedStaffId));
        sched.setStaffName(req.getStaffName());
        sched.setDayOfWeek(req.getDayOfWeek());
        sched.setShiftStart(req.getShiftStart());
        sched.setShiftEnd(req.getShiftEnd());
        sched.setDutyLocation(req.getDutyLocation());

        sched = staffScheduleRepository.save(sched);
        auditService.logAction("STAFF_SCHEDULE_CREATED", "StaffSchedule", currentUser, sched.getId(),
                Map.of("staff_type", sched.getStaffType(), "staff_name", sched.getStaffName()), ipAddress, userAgent);
        return toScheduleResponse(sched);
    }

    public NurseResponse toNurseResponse(Nurse n) {
        NurseResponse res = new NurseResponse();
        res.setId(n.getId());
        res.setNurseId(n.getNurseId());
        res.setUserId(n.getUserId());
        res.setFullName(n.getFullName());
        res.setDepartmentId(n.getDepartmentId());
        res.setShift(n.getShift());
        res.setPhone(n.getPhone());
        res.setEmail(n.getEmail());
        res.setStatus(n.getStatus());
        res.setLicenseNumber(n.getLicenseNumber());
        res.setCreatedAt(n.getCreatedAt());
        res.setUpdatedAt(n.getUpdatedAt());
        return res;
    }

    public ReceptionistResponse toReceptionistResponse(Receptionist r) {
        ReceptionistResponse res = new ReceptionistResponse();
        res.setId(r.getId());
        res.setReceptionistId(r.getReceptionistId());
        res.setUserId(r.getUserId());
        res.setFullName(r.getFullName());
        res.setShift(r.getShift());
        res.setPhone(r.getPhone());
        res.setEmail(r.getEmail());
        res.setStatus(r.getStatus());
        res.setCreatedAt(r.getCreatedAt());
        res.setUpdatedAt(r.getUpdatedAt());
        return res;
    }

    public PharmacistResponse toPharmacistResponse(Pharmacist ph) {
        PharmacistResponse res = new PharmacistResponse();
        res.setId(ph.getId());
        res.setPharmacistId(ph.getPharmacistId());
        res.setUserId(ph.getUserId());
        res.setFullName(ph.getFullName());
        res.setLicenseNumber(ph.getLicenseNumber());
        res.setPhone(ph.getPhone());
        res.setEmail(ph.getEmail());
        res.setStatus(ph.getStatus());
        res.setCreatedAt(ph.getCreatedAt());
        res.setUpdatedAt(ph.getUpdatedAt());
        return res;
    }

    public StaffScheduleResponse toScheduleResponse(StaffSchedule s) {
        StaffScheduleResponse res = new StaffScheduleResponse();
        res.setId(s.getId());
        res.setStaffType(s.getStaffType());
        res.setStaffId(String.valueOf(s.getStaffId()));
        res.setStaffName(s.getStaffName());
        res.setDayOfWeek(s.getDayOfWeek());
        res.setShiftStart(s.getShiftStart());
        res.setShiftEnd(s.getShiftEnd());
        res.setDutyLocation(s.getDutyLocation());
        res.setCreatedAt(s.getCreatedAt());
        res.setUpdatedAt(s.getUpdatedAt());
        return res;
    }
}
