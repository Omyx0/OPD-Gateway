-- ============================================================
-- Migration 002: Map tables, clinical records, doctor-departments,
--                system settings, and extended visit support
-- ============================================================

-- ── Doctor-Department junction (multi-specialty doctors) ─────
CREATE TABLE IF NOT EXISTS doctor_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(doctor_id, department_id)
);

-- ── Clinical Records (doctor consultation notes) ────────────
CREATE TABLE IF NOT EXISTS clinical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE SET NULL,
    subjective_notes TEXT,
    objective_notes TEXT,
    assessment TEXT,
    plan TEXT,
    diagnosis TEXT,
    disposition TEXT CHECK (disposition IN ('DISCHARGE', 'DISCHARGED', 'ADMIT', 'ADMITTED', 'REFER', 'REFERRED', 'FOLLOWUP', 'FOLLOW_UP')),
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_clinical_records_updated_at
    BEFORE UPDATE ON clinical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Hospital Map: Buildings ─────────────────────────────────
CREATE TABLE IF NOT EXISTS buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    location GEOGRAPHY(POINT, 4326),
    svg_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_buildings_updated_at
    BEFORE UPDATE ON buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Hospital Map: Floors ────────────────────────────────────
CREATE TABLE IF NOT EXISTS floors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    name TEXT NOT NULL,
    svg_map_data JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_floors_updated_at
    BEFORE UPDATE ON floors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Hospital Map: Rooms ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id UUID NOT NULL REFERENCES floors(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    room_number TEXT NOT NULL,
    room_type TEXT NOT NULL CHECK (room_type IN (
        'CONSULTATION', 'WAITING', 'RECEPTION', 'PHARMACY',
        'LABORATORY', 'RADIOLOGY', 'EMERGENCY', 'OFFICE',
        'DOCTOR_CABIN', 'STAFF_ROOM', 'RESTROOM', 'ELEVATOR',
        'STAIRCASE', 'CORRIDOR', 'ENTRANCE', 'OTHER'
    )),
    name TEXT,
    capacity INTEGER,
    x_coord NUMERIC,
    y_coord NUMERIC,
    width NUMERIC,
    height NUMERIC,
    svg_path TEXT,
    metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Hospital Map: Edges (navigation graph) ──────────────────
CREATE TABLE IF NOT EXISTS map_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    to_room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    distance NUMERIC DEFAULT 1,
    direction TEXT,
    is_accessible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(from_room_id, to_room_id)
);

-- ── System Settings ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Add consultation fields to visits ───────────────────────
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'visits' AND column_name = 'consulting_doctor_id'
    ) THEN
        ALTER TABLE visits ADD COLUMN consulting_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'visits' AND column_name = 'raw_symptoms_text'
    ) THEN
        ALTER TABLE visits ADD COLUMN raw_symptoms_text TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'visits' AND column_name = 'structured_symptoms'
    ) THEN
        ALTER TABLE visits ADD COLUMN structured_symptoms JSONB;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'visits' AND column_name = 'consultation_started_at'
    ) THEN
        ALTER TABLE visits ADD COLUMN consultation_started_at TIMESTAMPTZ;
    END IF;
END $$;

-- ── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_consulting_doctor ON visits(consulting_doctor_id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_visit_id ON queue_tickets(visit_id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_status ON queue_tickets(status);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_priority ON queue_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_symptoms_visit_id ON symptoms(visit_id);
CREATE INDEX IF NOT EXISTS idx_triage_assessments_visit_id ON triage_assessments(visit_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_doctor_departments_doctor ON doctor_departments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_departments_dept ON doctor_departments(department_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_rooms_department ON rooms(department_id);
CREATE INDEX IF NOT EXISTS idx_clinical_records_visit ON clinical_records(visit_id);
CREATE INDEX IF NOT EXISTS idx_clinical_records_doctor ON clinical_records(doctor_id);
