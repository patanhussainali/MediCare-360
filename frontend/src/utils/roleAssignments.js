/**
 * Central Role-to-Assignment Configuration for MediCare-360
 * Authority: Mirrors backend com.medicare360.common.RoleAssignments
 */

export const ROLE_ASSIGNMENTS = {
  DOCTOR: [
    'Cardiology',
    'Neurology',
    'ENT',
    'Pediatrics',
    'Orthopedics',
    'General Medicine',
    'Dermatology',
    'Emergency',
    'Oncology',
    'Gynecology & Obstetrics',
    'Ophthalmology',
    'Pulmonology',
    'Gastroenterology',
    'Nephrology',
    'Psychiatry',
  ],
  NURSE: [
    'General Nursing',
    'ICU',
    'Emergency',
    'Pediatrics',
    'Surgery',
    'Outpatient Care',
    'Maternity Care',
  ],
  RECEPTIONIST: [
    'Front Office',
    'Registration',
    'Appointment Desk',
    'Billing Desk',
    'Customer Support',
  ],
  PHARMACIST: [
    'Inpatient Pharmacy',
    'Outpatient Pharmacy',
    'Clinical Pharmacy',
    'Compounding',
  ],
  LAB_TECHNICIAN: [
    'Hematology',
    'Biochemistry',
    'Microbiology',
    'Pathology',
    'Radiology/Imaging',
  ],
  ADMIN: [
    'Administration',
    'Human Resources',
    'Operations',
    'IT & Systems',
  ],
  PATIENT: [],
};

/**
 * Returns available assignments/departments for a given role string.
 */
export const getAssignmentsForRole = (role) => {
  if (!role) return [];
  const normalized = role.toUpperCase();
  if (normalized === 'ADMINISTRATOR') return ROLE_ASSIGNMENTS.ADMIN;
  return ROLE_ASSIGNMENTS[normalized] || [];
};

/**
 * Validates whether an assignment is valid for a given role.
 */
export const isValidRoleAssignment = (role, assignment) => {
  const normalized = (role || '').toUpperCase();
  if (normalized === 'PATIENT') {
    return !assignment || assignment === 'N/A' || assignment === 'None' || assignment.trim() === '';
  }
  const validList = getAssignmentsForRole(normalized);
  if (!validList || validList.length === 0) return false;
  return validList.some(item => item.toLowerCase() === (assignment || '').trim().toLowerCase());
};

