# Automated Comprehensive Test Suite for MediCare360 Java Backend
$baseUrl = "http://localhost:8000"
$passCount = 0
$failCount = 0

function Assert-Test {
    param(
        [string]$TestName,
        [bool]$Condition,
        [string]$Details = ""
    )
    if ($Condition) {
        Write-Host "  [PASS] $TestName" -ForegroundColor Green
        $script:passCount++
    } else {
        Write-Host "  [FAIL] $TestName : $Details" -ForegroundColor Red
        $script:failCount++
    }
}

Write-Host "`n=== Phase 4 & Phase 5: Executing API & RBAC Test Suite ===" -ForegroundColor Cyan

# 1. Health Endpoint
try {
    $h = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Assert-Test "GET /health status is healthy" ($h.status -eq "healthy")
    Assert-Test "GET /health service is medicare360" ($h.service -eq "medicare360")
} catch {
    Assert-Test "GET /health reachable" $false $_
}

# 2. Check Admin
try {
    $ca = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/check-admin" -Method Get
    Assert-Test "GET /api/v1/auth/check-admin hasAdmin is boolean" ($ca.hasAdmin -eq $true -or $ca.hasAdmin -eq $false)
} catch {
    Assert-Test "GET /api/v1/auth/check-admin reachable" $false $_
}

# 3. Duplicate Patient Registration
try {
    $body = '{"email": "demo_patient@hospital.com", "password": "SecurePass@123", "full_name": "Duplicate User", "role": "PATIENT"}'
    $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/register" -Method Post -ContentType "application/json" -Body $body
    Assert-Test "POST /api/v1/auth/register duplicate email should fail" $false "Expected HTTP 400"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Assert-Test "POST /api/v1/auth/register duplicate email rejected (400)" ($status -eq 400) "Returned $status"
}

# 4. Invalid Password Login
try {
    $body = '{"email": "demo_patient@hospital.com", "password": "WrongPassword!999"}'
    $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $body
    Assert-Test "POST /api/v1/auth/login wrong password should fail" $false "Expected error"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Assert-Test "POST /api/v1/auth/login wrong password rejected (400/401)" ($status -eq 400 -or $status -eq 401) "Returned $status"
}

# 5. Cross-Role Portal Rejection (Patient logging in through ADMIN portal)
try {
    $body = '{"email": "demo_patient@hospital.com", "password": "SecurePass@123", "role": "ADMIN"}'
    $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $body
    Assert-Test "POST /api/v1/auth/login cross-role rejection should fail" $false "Expected error"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Assert-Test "POST /api/v1/auth/login cross-role rejection (400/401)" ($status -eq 400 -or $status -eq 401) "Returned $status"
}

# 6. Valid Patient Login
$patientToken = $null
$refreshToken = $null
try {
    $body = '{"email": "demo_patient@hospital.com", "password": "SecurePass@123", "role": "PATIENT"}'
    $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/login" -Method Post -ContentType "application/json" -Body $body
    $patientToken = $res.access_token
    $refreshToken = $res.refresh_token
    Assert-Test "POST /api/v1/auth/login valid patient succeeds" ($null -ne $patientToken -and $patientToken.Length -gt 20)
    Assert-Test "POST /api/v1/auth/login returns correct user role" ($res.user.role -eq "PATIENT")
    Assert-Test "POST /api/v1/auth/login returns bearer token_type" ($res.token_type -eq "bearer")
    Assert-Test "POST /api/v1/auth/login never exposes hashed_password" ($null -eq $res.user.hashed_password)
} catch {
    Assert-Test "POST /api/v1/auth/login patient login" $false $_
}

$headers = @{
    "Authorization" = "Bearer $patientToken"
}

# 7. GET /api/v1/auth/me and /api/v1/users/me with Valid Token
try {
    $meAuth = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/me" -Method Get -Headers $headers
    Assert-Test "GET /api/v1/auth/me returns authenticated user" ($meAuth.email -eq "demo_patient@hospital.com")
} catch {
    Assert-Test "GET /api/v1/auth/me" $false $_
}

try {
    $meUser = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/me" -Method Get -Headers $headers
    Assert-Test "GET /api/v1/users/me returns authenticated user" ($meUser.email -eq "demo_patient@hospital.com")
} catch {
    Assert-Test "GET /api/v1/users/me" $false $_
}

# 8. RBAC: Patient Forbidden from Admin Audit Logs
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/audit-logs" -Method Get -Headers $headers
    Assert-Test "GET /api/v1/audit-logs patient should be forbidden" $false "Expected HTTP 403"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Assert-Test "GET /api/v1/audit-logs patient access rejected with HTTP 403" ($status -eq 403) "Returned $status"
}

# 9. RBAC: Unauthenticated Access to Protected Endpoint
try {
    $res = Invoke-RestMethod -Uri "$baseUrl/api/v1/audit-logs" -Method Get
    Assert-Test "GET /api/v1/audit-logs without token should fail" $false "Expected HTTP 401"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Assert-Test "GET /api/v1/audit-logs unauthenticated rejected with HTTP 401" ($status -eq 401) "Returned $status"
}

# 10. Departments List (Authenticated)
try {
    $depts = Invoke-RestMethod -Uri "$baseUrl/api/v1/departments" -Method Get -Headers $headers
    $hasDepts = ($null -ne $depts -and @($depts).Count -ge 1)
    Assert-Test "GET /api/v1/departments returns department list" $hasDepts
} catch {
    Assert-Test "GET /api/v1/departments" $false $_
}

# 11. Doctors List (Authenticated)
try {
    $docs = Invoke-RestMethod -Uri "$baseUrl/api/v1/doctors" -Method Get -Headers $headers
    $hasDocs = ($null -ne $docs)
    Assert-Test "GET /api/v1/doctors returns doctors" $hasDocs
} catch {
    Assert-Test "GET /api/v1/doctors" $false $_
}

# 12. Patients Me Profile
try {
    $p = Invoke-RestMethod -Uri "$baseUrl/api/v1/patients/me" -Method Get -Headers $headers
    Assert-Test "GET /api/v1/patients/me returns patient profile" ($null -ne $p.patient_id)
} catch {
    Assert-Test "GET /api/v1/patients/me" $false $_
}

# 13. Appointments List for Patient
try {
    $appts = Invoke-RestMethod -Uri "$baseUrl/api/v1/appointments" -Method Get -Headers $headers
    $hasAppts = ($null -ne $appts)
    Assert-Test "GET /api/v1/appointments returns appointment list" $hasAppts
} catch {
    Assert-Test "GET /api/v1/appointments" $false $_
}

# 14. Notifications List
try {
    $notifs = Invoke-RestMethod -Uri "$baseUrl/api/v1/notifications" -Method Get -Headers $headers
    $hasNotifs = ($null -ne $notifs)
    Assert-Test "GET /api/v1/notifications returns user notifications" $hasNotifs
} catch {
    Assert-Test "GET /api/v1/notifications" $false $_
}

# 15. Token Refresh
try {
    $refBody = '{"refresh_token": "' + $refreshToken + '"}'
    $refRes = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/refresh" -Method Post -ContentType "application/json" -Body $refBody
    Assert-Test "POST /api/v1/auth/refresh returns new access token" ($null -ne $refRes.access_token -and $refRes.access_token.Length -gt 20)
} catch {
    Assert-Test "POST /api/v1/auth/refresh" $false $_
}

# 16. Logout Flow
try {
    $lo = Invoke-RestMethod -Uri "$baseUrl/api/v1/auth/logout" -Method Post -Headers $headers
    Assert-Test "POST /api/v1/auth/logout succeeds" ($null -ne $lo.message -or $null -ne $lo.detail)
} catch {
    Assert-Test "POST /api/v1/auth/logout" $false $_
}

# 17. Blacklisted Token Rejection after Logout
try {
    $meAfter = Invoke-RestMethod -Uri "$baseUrl/api/v1/users/me" -Method Get -Headers $headers
    Assert-Test "GET /api/v1/users/me with blacklisted token should fail" $false "Expected HTTP 401"
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    Assert-Test "GET /api/v1/users/me blacklisted token rejected with HTTP 401" ($status -eq 401) "Returned $status"
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Total Passed: $passCount" -ForegroundColor Green
Write-Host "Total Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
if ($failCount -gt 0) { exit 1 } else { exit 0 }
