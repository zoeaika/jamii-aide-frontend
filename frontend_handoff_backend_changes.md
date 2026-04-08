# Frontend Handoff: Current Backend Contract

## Date
- April 6, 2026

## Auth role contract

Roles are now:

- `user`
- `nurse`
- `admin`

Public auth rules:

- Public signup does not choose a role.
- `POST /api/auth/register/` always creates a `user`.
- Google sign-in also creates a `user` by default.
- `nurse` and `admin` must be assigned by an admin.

## 1) Care Request Workflow (via `Appointment`)

### New/Updated Status Values
- `SUBMITTED`
- `UNDER_REVIEW`
- `NURSE_SUGGESTED`
- `APPROVED`
- `REJECTED`
- Existing statuses still present: `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`, `RESCHEDULED`

### Flow
1. End user submits request (`SUBMITTED`)
2. Admin suggests nurse (`NURSE_SUGGESTED`)
3. Admin final decision:
- approve -> `APPROVED`
- reject -> `REJECTED` (with reason)

### Request Fields Added
- `additional_notes: string | null`
- `shift_type: "DAILY_PER_HOUR_12H" | "LIVE_IN_24H"`
- `evaluation_type: "ONLINE_CALL" | "PHYSICAL_VISIT" | null`
- `admission_clause_accepted: boolean`
- `admission_support_in_subscription: boolean`
- `admission_questionnaire: object`
- `suggested_nurse: uuid | null` (admin-set)
- `reviewed_by: uuid | null` (admin-set)
- `rejection_reason: string | null`
- `decision_at: datetime | null`

### Important Rule Changes
- End user no longer selects nurse during creation.
- Admin suggests nurse and does final approve/reject.
- If admission support is enabled (`admission_clause_accepted` or `admission_support_in_subscription`), `admission_questionnaire` is required.
- Rejection requires `rejection_reason`.

### Required `admission_questionnaire` Keys (when required)
- `insurance_details`
- `last_procedure`
- `medical_conditions`
- `allergies`
- `emergency_contact`
- `consent_for_emergency_admission`

## 2) Appointment Endpoints

### Existing Base
- `GET /api/appointments/`
- `POST /api/appointments/`
- `GET /api/appointments/{id}/`
- `PATCH /api/appointments/{id}/`

### New Admin Actions
- `GET /api/appointments/pending-matching/`
- `POST /api/appointments/{id}/suggest-nurse/`
- `POST /api/appointments/{id}/decision/`

### Existing Actions (behavior updated)
- `POST /api/appointments/{id}/confirm/`
  - allowed from `APPROVED` (and legacy `PENDING`)
- `POST /api/appointments/{id}/cancel/`
  - allows submitted/review/approved flow states + confirmed/pending

### Sample: Create Appointment Request
```json
{
  "family_member": "uuid",
  "appointment_date": "2026-03-01",
  "start_time": "09:00:00",
  "end_time": "11:00:00",
  "reason": "Post-discharge support",
  "service_type": "Home Visit",
  "shift_type": "DAILY_PER_HOUR_12H",
  "evaluation_type": "ONLINE_CALL",
  "visit_address": "Westlands",
  "visit_city": "Nairobi",
  "notes": "General care instructions",
  "additional_notes": "Prefer Swahili-speaking nurse",
  "admission_clause_accepted": true,
  "admission_support_in_subscription": true,
  "admission_questionnaire": {
    "insurance_details": "AAR, member #123",
    "last_procedure": "Hip surgery Jan 2026",
    "medical_conditions": "Hypertension",
    "allergies": "Penicillin",
    "emergency_contact": "+254700000000",
    "consent_for_emergency_admission": true
  }
}
```

### Sample: Suggest Nurse (Admin)
```json
{
  "suggested_nurse": "uuid"
}
```

### Sample: Final Decision (Admin Approve)
```json
{
  "decision": "APPROVED"
}
```

### Sample: Final Decision (Admin Reject)
```json
{
  "decision": "REJECTED",
  "rejection_reason": "Incomplete medical details"
}
```

## 3) Notifications

### Event Types
- `NURSE_SUGGESTED`
- `REQUEST_APPROVED`
- `REQUEST_REJECTED`

### Endpoints
- `GET /api/notifications/`
- `GET /api/notifications/?is_read=false`
- `POST /api/notifications/{id}/mark-read/`
- `POST /api/notifications/mark-all-read/`
- `GET /api/notifications/unread-count/`

### Notification Payload Fields
- `id`
- `recipient`
- `appointment`
- `event_type`
- `event_type_display`
- `title`
- `message`
- `is_read`
- `created_at`

## 4) Healthcare Professional Categories

### New Field on Nurse
- `professional_type`

### Values
- `PHYSIOTHERAPIST`
- `CAREGIVER_NURSE`
- `PALLIATIVE_CARE_NURSE`

### API Support
- Included in nurse serializer:
  - `professional_type`
  - `professional_type_display`
- Filter supported:
  - `GET /api/nurses/?professional_type=PHYSIOTHERAPIST`

## 5) Auth endpoint summary

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/google/`
- `POST /api/auth/refresh/`
- `GET /api/auth/me/`

Frontend route mapping:

- `user` -> `/dashboard`
- `nurse` -> `/nurse/dashboard`
- `admin` -> `/admin/dashboard`

## 6) Frontend Integration Checklist

1. Remove any role picker from public signup.
2. Treat all public signups as `user`.
3. Redirect by the backend-returned `user.role`.
4. Remove nurse selection from end-user request creation UI.
5. Add UI for:
- `additional_notes`
- `shift_type`
- `evaluation_type`
- admission fields and questionnaire
6. Add admin pages/actions:
- pending matching queue
- suggest nurse
- final approve/reject (with reason)
7. Add notifications center and unread badge using `/api/notifications/*`.
8. Add nurse filtering by `professional_type`.

## 7) Validation + Testing Status
- Backend migration chain is repaired through `0009`.
- Local backend database has been reconciled.
- Backend auth contract is now stable for frontend integration.
