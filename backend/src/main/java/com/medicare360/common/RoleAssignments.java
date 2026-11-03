package com.medicare360.common;

import com.medicare360.entity.UserRole;
import java.util.*;

public class RoleAssignments {

    private static final Map<UserRole, List<String>> ROLE_ASSIGNMENTS = new LinkedHashMap<>();

    static {
        ROLE_ASSIGNMENTS.put(UserRole.DOCTOR, List.of(
            "Cardiology", "Neurology", "ENT", "Pediatrics", "Orthopedics",
            "General Medicine", "Dermatology", "Emergency", "Oncology",
            "Gynecology & Obstetrics", "Ophthalmology", "Pulmonology",
            "Gastroenterology", "Nephrology", "Psychiatry"
        ));

        ROLE_ASSIGNMENTS.put(UserRole.NURSE, List.of(
            "General Nursing", "ICU", "Emergency", "Pediatrics", "Surgery",
            "Outpatient Care", "Maternity Care"
        ));

        ROLE_ASSIGNMENTS.put(UserRole.RECEPTIONIST, List.of(
            "Front Office", "Registration", "Appointment Desk", "Billing Desk",
            "Customer Support"
        ));

        ROLE_ASSIGNMENTS.put(UserRole.PHARMACIST, List.of(
            "Inpatient Pharmacy", "Outpatient Pharmacy", "Clinical Pharmacy",
            "Compounding"
        ));

        ROLE_ASSIGNMENTS.put(UserRole.LAB_TECHNICIAN, List.of(
            "Hematology", "Biochemistry", "Microbiology", "Pathology",
            "Radiology/Imaging"
        ));

        ROLE_ASSIGNMENTS.put(UserRole.ADMIN, List.of(
            "Administration", "Human Resources", "Operations", "IT & Systems"
        ));

        ROLE_ASSIGNMENTS.put(UserRole.PATIENT, Collections.emptyList());
    }

    public static List<String> getAssignmentsForRole(UserRole role) {
        if (role == null) return Collections.emptyList();
        return ROLE_ASSIGNMENTS.getOrDefault(role, Collections.emptyList());
    }

    public static Map<String, List<String>> getAllRoleAssignments() {
        Map<String, List<String>> map = new LinkedHashMap<>();
        for (Map.Entry<UserRole, List<String>> entry : ROLE_ASSIGNMENTS.entrySet()) {
            map.put(entry.getKey().name(), entry.getValue());
        }
        return map;
    }

    public static boolean isValidAssignment(UserRole role, String department) {
        if (role == UserRole.PATIENT) {
            return department == null || department.isBlank() ||
                   department.equalsIgnoreCase("N/A") || department.equalsIgnoreCase("None");
        }
        if (department == null || department.isBlank()) {
            return false;
        }
        if (role == UserRole.DOCTOR) return true;
        List<String> valid = getAssignmentsForRole(role);
        return valid.stream().anyMatch(v -> v.equalsIgnoreCase(department.trim()));
    }
}

