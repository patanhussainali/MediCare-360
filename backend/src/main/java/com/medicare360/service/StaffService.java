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
import org.springframework.transaction.annotation.Transactional;

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

    public StaffService(
            NurseRepository nurseRepository,
            ReceptionistRepository receptionistRepository,
            PharmacistRepository pharmacistRepository,
            StaffScheduleRepository staffScheduleRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService
    ) {
        this.nurseRepository = nurseRepository;
        this.receptionistRepository = receptionistRepository;
        this.pharmacistRepository = pharmacistRepository;
        this.staffScheduleRepository = staffScheduleRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    // --- NURSES ---
    @Transactional(readOnly = true)
    public List<NurseResponse> getNurses(int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size);

        Page<Nurse> nurses = nurseRepository.findAll(pageable);
        return nurses.getContent().stream().map(this::toNurseResponse).toList();
    }

    @Transactional(readOnly = true)
    public NurseResponse getNurseById(Long id) {
        Nurse n = nurseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Nurse not found"));
        return toNurseResponse(n);
    }

    @Transactional
    public NurseResponse createNurse(NurseCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' is already registered in the system.");
        }

        String password = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword()
                : UUID.randomUUID().toString().substring(0, 12);

        User user = new User();
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
        nurse.setUser(user);
        nurse.setFullName(req.getFullName());
        nurse.setLicenseNumber(req.getLicenseNumber());
        nurse.setShift(req.getShift() != null ? req.getShift() : "Morning");
        nurse.setPhone(req.getPhone());
        nurse.setEmail(cleanEmail);
        nurse.setStatus(req.getStatus() != null ? req.getStatus() : "Active");

        if (req.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(req.getDepartmentId()).orElse(null);
            nurse.setDepartment(dept);
        }

        nurse = nurseRepository.save(nurse);

        auditService.logAction(
                "NURSE_CREATED",
                "Nurse",
                currentUser,
                nurse.getId().toString(),
                Map.of("email", nurse.getEmail()),
                ipAddress,
                userAgent
        );

        return toNurseResponse(nurse);
    }

    // --- RECEPTIONISTS ---
    @Transactional(readOnly = true)
    public List<ReceptionistResponse> getReceptionists(int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size);

        Page<Receptionist> receptionists = receptionistRepository.findAll(pageable);
        return receptionists.getContent().stream().map(this::toReceptionistResponse).toList();
    }

    @Transactional(readOnly = true)
    public ReceptionistResponse getReceptionistById(Long id) {
        Receptionist r = receptionistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receptionist not found"));
        return toReceptionistResponse(r);
    }

    @Transactional
    public ReceptionistResponse createReceptionist(ReceptionistCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' is already registered in the system.");
        }

        String password = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword()
                : UUID.randomUUID().toString().substring(0, 12);

        User user = new User();
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
        rec.setUser(user);
        rec.setFullName(req.getFullName());
        rec.setShift(req.getShift() != null ? req.getShift() : "Day");
        rec.setPhone(req.getPhone());
        rec.setEmail(cleanEmail);
        rec.setStatus(req.getStatus() != null ? req.getStatus() : "Active");

        rec = receptionistRepository.save(rec);

        auditService.logAction(
                "RECEPTIONIST_CREATED",
                "Receptionist",
                currentUser,
                rec.getId().toString(),
                Map.of("email", rec.getEmail()),
                ipAddress,
                userAgent
        );

        return toReceptionistResponse(rec);
    }

    // --- PHARMACISTS ---
    @Transactional(readOnly = true)
    public List<PharmacistResponse> getPharmacists(int skip, int limit) {
        int page = limit > 0 ? skip / limit : 0;
        int size = limit > 0 ? limit : 50;
        Pageable pageable = PageRequest.of(page, size);

        Page<Pharmacist> pharmacists = pharmacistRepository.findAll(pageable);
        return pharmacists.getContent().stream().map(this::toPharmacistResponse).toList();
    }

    @Transactional(readOnly = true)
    public PharmacistResponse getPharmacistById(Long id) {
        Pharmacist ph = pharmacistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacist not found"));
        return toPharmacistResponse(ph);
    }

    @Transactional
    public PharmacistResponse createPharmacist(PharmacistCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        String cleanEmail = req.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(cleanEmail)) {
            throw new BadRequestException("Email '" + cleanEmail + "' is already registered in the system.");
        }

        String password = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword()
                : UUID.randomUUID().toString().substring(0, 12);

        User user = new User();
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
        ph.setUser(user);
        ph.setFullName(req.getFullName());
        ph.setLicenseNumber(req.getLicenseNumber());
        ph.setPhone(req.getPhone());
        ph.setEmail(cleanEmail);
        ph.setStatus(req.getStatus() != null ? req.getStatus() : "Active");

        ph = pharmacistRepository.save(ph);

        auditService.logAction(
                "PHARMACIST_CREATED",
                "Pharmacist",
                currentUser,
                ph.getId().toString(),
                Map.of("email", ph.getEmail()),
                ipAddress,
                userAgent
        );

        return toPharmacistResponse(ph);
    }

    // --- SCHEDULES ---
    @Transactional(readOnly = true)
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

    @Transactional
    public StaffScheduleResponse createSchedule(StaffScheduleCreateRequest req, User currentUser, String ipAddress, String userAgent) {
        StaffSchedule sched = new StaffSchedule();
        sched.setStaffType(req.getStaffType());
        sched.setStaffId(req.getStaffId() != null ? req.getStaffId().intValue() : 0);
        sched.setStaffName(req.getStaffName());
        sched.setDayOfWeek(req.getDayOfWeek());
        sched.setShiftStart(req.getShiftStart());
        sched.setShiftEnd(req.getShiftEnd());
        sched.setDutyLocation(req.getDutyLocation());

        sched = staffScheduleRepository.save(sched);

        auditService.logAction(
                "STAFF_SCHEDULE_CREATED",
                "StaffSchedule",
                currentUser,
                sched.getId().toString(),
                Map.of("staff_type", sched.getStaffType(), "staff_name", sched.getStaffName()),
                ipAddress,
                userAgent
        );

        return toScheduleResponse(sched);
    }

    public NurseResponse toNurseResponse(Nurse n) {
        NurseResponse res = new NurseResponse();
        res.setId(n.getId());
        res.setNurseId(n.getNurseId());
        if (n.getUser() != null) res.setUserId(n.getUser().getId());
        res.setFullName(n.getFullName());
        if (n.getDepartment() != null) res.setDepartmentId(n.getDepartment().getId());
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
        if (r.getUser() != null) res.setUserId(r.getUser().getId());
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
        if (ph.getUser() != null) res.setUserId(ph.getUser().getId());
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
        res.setStaffId((long) s.getStaffId());
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
