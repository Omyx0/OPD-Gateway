-- ============================================================
-- Migration 003: Row Level Security policies for all tables
-- Self-healing & idempotent: ensures columns & tables exist, drops duplicate policies
-- ============================================================

-- ── 1. Ensure required columns exist on existing tables ──────

ALTER TABLE patients ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ── 2. Ensure all dependent tables exist before enabling RLS ─

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    provider TEXT,
    model_name TEXT,
    operation TEXT,
    input_type TEXT,
    success BOOLEAN,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medications JSONB NOT NULL DEFAULT '[]'::jsonb,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    submitted_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. Enable RLS on all tables ──────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- ── 4. Helper functions ──────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
    SELECT role FROM user_roles WHERE user_id = $1 LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_staff_or_above(user_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = $1 AND role IN ('STAFF', 'DOCTOR', 'ADMIN')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── 5. Profiles Policies ─────────────────────────────────────
DROP POLICY IF EXISTS profiles_self_read ON profiles;
CREATE POLICY profiles_self_read ON profiles FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_staff_read ON profiles;
CREATE POLICY profiles_staff_read ON profiles FOR SELECT USING (is_staff_or_above(auth.uid()));

DROP POLICY IF EXISTS profiles_self_update ON profiles;
CREATE POLICY profiles_self_update ON profiles FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS profiles_admin_all ON profiles;
CREATE POLICY profiles_admin_all ON profiles FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

-- ── 6. User Roles Policies ───────────────────────────────────
DROP POLICY IF EXISTS roles_self_read ON user_roles;
CREATE POLICY roles_self_read ON user_roles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS roles_admin_all ON user_roles;
CREATE POLICY roles_admin_all ON user_roles FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

-- ── 7. Hospitals & Departments (public read) ─────────────────
DROP POLICY IF EXISTS hospitals_read ON hospitals;
CREATE POLICY hospitals_read ON hospitals FOR SELECT USING (true);

DROP POLICY IF EXISTS hospitals_admin ON hospitals;
CREATE POLICY hospitals_admin ON hospitals FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

DROP POLICY IF EXISTS departments_read ON departments;
CREATE POLICY departments_read ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS departments_admin ON departments;
CREATE POLICY departments_admin ON departments FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

-- ── 8. Doctors Policies ──────────────────────────────────────
DROP POLICY IF EXISTS doctors_read ON doctors;
CREATE POLICY doctors_read ON doctors FOR SELECT USING (true);

DROP POLICY IF EXISTS doctors_self_update ON doctors;
CREATE POLICY doctors_self_update ON doctors FOR UPDATE USING (profile_id = auth.uid());

DROP POLICY IF EXISTS doctors_admin ON doctors;
CREATE POLICY doctors_admin ON doctors FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

-- ── 9. Doctor Departments Policies ───────────────────────────
DROP POLICY IF EXISTS doctor_dept_read ON doctor_departments;
CREATE POLICY doctor_dept_read ON doctor_departments FOR SELECT USING (true);

DROP POLICY IF EXISTS doctor_dept_admin ON doctor_departments;
CREATE POLICY doctor_dept_admin ON doctor_departments FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

-- ── 10. Patients Policies ────────────────────────────────────
DROP POLICY IF EXISTS patients_self_read ON patients;
CREATE POLICY patients_self_read ON patients FOR SELECT USING (
    id = auth.uid() OR auth_user_id = auth.uid()
);

DROP POLICY IF EXISTS patients_staff_read ON patients;
CREATE POLICY patients_staff_read ON patients FOR SELECT USING (is_staff_or_above(auth.uid()));

DROP POLICY IF EXISTS patients_self_insert ON patients;
CREATE POLICY patients_self_insert ON patients FOR INSERT WITH CHECK (
    id = auth.uid() OR auth_user_id = auth.uid()
);

DROP POLICY IF EXISTS patients_staff_insert ON patients;
CREATE POLICY patients_staff_insert ON patients FOR INSERT WITH CHECK (is_staff_or_above(auth.uid()));

DROP POLICY IF EXISTS patients_staff_update ON patients;
CREATE POLICY patients_staff_update ON patients FOR UPDATE USING (is_staff_or_above(auth.uid()));

DROP POLICY IF EXISTS patients_self_update ON patients;
CREATE POLICY patients_self_update ON patients FOR UPDATE USING (
    id = auth.uid() OR auth_user_id = auth.uid()
);

-- ── 11. Visits Policies ──────────────────────────────────────
DROP POLICY IF EXISTS visits_patient_read ON visits;
CREATE POLICY visits_patient_read ON visits FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE id = auth.uid() OR auth_user_id = auth.uid())
);

DROP POLICY IF EXISTS visits_staff_all ON visits;
CREATE POLICY visits_staff_all ON visits FOR ALL USING (is_staff_or_above(auth.uid()));

-- ── 12. Symptoms Policies ────────────────────────────────────
DROP POLICY IF EXISTS symptoms_patient_read ON symptoms;
CREATE POLICY symptoms_patient_read ON symptoms FOR SELECT USING (
    visit_id IN (SELECT id FROM visits WHERE patient_id IN (SELECT id FROM patients WHERE id = auth.uid() OR auth_user_id = auth.uid()))
);

DROP POLICY IF EXISTS symptoms_patient_insert ON symptoms;
CREATE POLICY symptoms_patient_insert ON symptoms FOR INSERT WITH CHECK (
    visit_id IN (SELECT id FROM visits WHERE patient_id IN (SELECT id FROM patients WHERE id = auth.uid() OR auth_user_id = auth.uid()))
);

DROP POLICY IF EXISTS symptoms_staff_all ON symptoms;
CREATE POLICY symptoms_staff_all ON symptoms FOR ALL USING (is_staff_or_above(auth.uid()));

-- ── 13. Triage Assessments Policies ──────────────────────────
DROP POLICY IF EXISTS triage_patient_read ON triage_assessments;
CREATE POLICY triage_patient_read ON triage_assessments FOR SELECT USING (
    visit_id IN (SELECT id FROM visits WHERE patient_id IN (SELECT id FROM patients WHERE id = auth.uid() OR auth_user_id = auth.uid()))
);

DROP POLICY IF EXISTS triage_staff_all ON triage_assessments;
CREATE POLICY triage_staff_all ON triage_assessments FOR ALL USING (is_staff_or_above(auth.uid()));

-- ── 14. Queue Tickets Policies ───────────────────────────────
DROP POLICY IF EXISTS queue_patient_read ON queue_tickets;
CREATE POLICY queue_patient_read ON queue_tickets FOR SELECT USING (
    visit_id IN (SELECT id FROM visits WHERE patient_id IN (SELECT id FROM patients WHERE id = auth.uid() OR auth_user_id = auth.uid()))
);

DROP POLICY IF EXISTS queue_staff_all ON queue_tickets;
CREATE POLICY queue_staff_all ON queue_tickets FOR ALL USING (is_staff_or_above(auth.uid()));

-- ── 15. Clinical Records Policies ────────────────────────────
DROP POLICY IF EXISTS clinical_patient_read ON clinical_records;
CREATE POLICY clinical_patient_read ON clinical_records FOR SELECT USING (
    visit_id IN (SELECT id FROM visits WHERE patient_id IN (SELECT id FROM patients WHERE id = auth.uid() OR auth_user_id = auth.uid()))
);

DROP POLICY IF EXISTS clinical_doctor_all ON clinical_records;
CREATE POLICY clinical_doctor_all ON clinical_records FOR ALL USING (
    get_user_role(auth.uid()) IN ('DOCTOR', 'ADMIN')
);

-- ── 16. Alerts Policies ──────────────────────────────────────
DROP POLICY IF EXISTS alerts_staff_all ON alerts;
CREATE POLICY alerts_staff_all ON alerts FOR ALL USING (is_staff_or_above(auth.uid()));

-- ── 17. Notifications Policies ───────────────────────────────
DROP POLICY IF EXISTS notifications_self_read ON notifications;
CREATE POLICY notifications_self_read ON notifications FOR SELECT USING (recipient_user_id = auth.uid());

DROP POLICY IF EXISTS notifications_self_update ON notifications;
CREATE POLICY notifications_self_update ON notifications FOR UPDATE USING (recipient_user_id = auth.uid());

DROP POLICY IF EXISTS notifications_staff_insert ON notifications;
CREATE POLICY notifications_staff_insert ON notifications FOR INSERT WITH CHECK (is_staff_or_above(auth.uid()));

-- ── 18. Audit Logs Policies ──────────────────────────────────
DROP POLICY IF EXISTS audit_admin_read ON audit_logs;
CREATE POLICY audit_admin_read ON audit_logs FOR SELECT USING (get_user_role(auth.uid()) = 'ADMIN');

DROP POLICY IF EXISTS audit_staff_insert ON audit_logs;
CREATE POLICY audit_staff_insert ON audit_logs FOR INSERT WITH CHECK (is_staff_or_above(auth.uid()));

-- ── 19. AI Interactions Policies ─────────────────────────────
DROP POLICY IF EXISTS ai_staff_all ON ai_interactions;
CREATE POLICY ai_staff_all ON ai_interactions FOR ALL USING (is_staff_or_above(auth.uid()));

-- ── 20. Prescriptions Policies ───────────────────────────────
DROP POLICY IF EXISTS prescriptions_patient_read ON prescriptions;
CREATE POLICY prescriptions_patient_read ON prescriptions FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE id = auth.uid() OR auth_user_id = auth.uid())
);

DROP POLICY IF EXISTS prescriptions_doctor_all ON prescriptions;
CREATE POLICY prescriptions_doctor_all ON prescriptions FOR ALL USING (
    get_user_role(auth.uid()) IN ('DOCTOR', 'ADMIN')
);

-- ── 21. Feedback Policies ────────────────────────────────────
DROP POLICY IF EXISTS feedback_patient_own ON feedback;
CREATE POLICY feedback_patient_own ON feedback FOR ALL USING (
    patient_id IN (SELECT id FROM patients WHERE id = auth.uid() OR auth_user_id = auth.uid())
);

DROP POLICY IF EXISTS feedback_staff_read ON feedback;
CREATE POLICY feedback_staff_read ON feedback FOR SELECT USING (is_staff_or_above(auth.uid()));

-- ── 22. Map Tables (public read) ─────────────────────────────
DROP POLICY IF EXISTS buildings_read ON buildings;
CREATE POLICY buildings_read ON buildings FOR SELECT USING (true);

DROP POLICY IF EXISTS buildings_admin ON buildings;
CREATE POLICY buildings_admin ON buildings FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

DROP POLICY IF EXISTS floors_read ON floors;
CREATE POLICY floors_read ON floors FOR SELECT USING (true);

DROP POLICY IF EXISTS floors_admin ON floors;
CREATE POLICY floors_admin ON floors FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

DROP POLICY IF EXISTS rooms_read ON rooms;
CREATE POLICY rooms_read ON rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS rooms_admin ON rooms;
CREATE POLICY rooms_admin ON rooms FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

DROP POLICY IF EXISTS edges_read ON map_edges;
CREATE POLICY edges_read ON map_edges FOR SELECT USING (true);

DROP POLICY IF EXISTS edges_admin ON map_edges;
CREATE POLICY edges_admin ON map_edges FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');

-- ── 23. System Settings Policies ─────────────────────────────
DROP POLICY IF EXISTS settings_staff_read ON system_settings;
CREATE POLICY settings_staff_read ON system_settings FOR SELECT USING (is_staff_or_above(auth.uid()));

DROP POLICY IF EXISTS settings_admin_all ON system_settings;
CREATE POLICY settings_admin_all ON system_settings FOR ALL USING (get_user_role(auth.uid()) = 'ADMIN');
