-- backend/migrations/001_create_student_fund_tables.sql

-- Departments table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches table (CSE, EE, Civil, etc.)
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, name)
);

-- Semesters table
CREATE TABLE semesters (
    id SERIAL PRIMARY KEY,
    semester_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(20) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Funds table
CREATE TABLE student_funds (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    semester_id INTEGER REFERENCES semesters(id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL,
    fund_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    pending_amount DECIMAL(10, 2) GENERATED ALWAYS AS (fund_amount - paid_amount) STORED,
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'partial', 'paid'
    payment_date DATE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_payment_status CHECK (payment_status IN ('pending', 'partial', 'paid')),
    CONSTRAINT valid_amount CHECK (paid_amount >= 0 AND paid_amount <= fund_amount)
);

-- Fund Collections (for tracking overall collection)
CREATE TABLE fund_collections (
    id SERIAL PRIMARY KEY,
    semester_id INTEGER REFERENCES semesters(id) ON DELETE CASCADE,
    department_id INTEGER REFERENCES departments(id) ON DELETE CASCADE,
    branch_id INTEGER REFERENCES branches(id) ON DELETE CASCADE,
    total_students INTEGER DEFAULT 0,
    total_fund_required DECIMAL(10, 2) DEFAULT 0.00,
    total_fund_collected DECIMAL(10, 2) DEFAULT 0.00,
    total_fund_pending DECIMAL(10, 2) GENERATED ALWAYS AS (total_fund_required - total_fund_collected) STORED,
    collection_percentage DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE 
            WHEN total_fund_required = 0 THEN 0
            ELSE (total_fund_collected / total_fund_required * 100)
        END
    ) STORED,
    collected_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(semester_id, department_id, branch_id)
);

-- Create indexes for better performance
CREATE INDEX idx_student_funds_semester ON student_funds(semester_id);
CREATE INDEX idx_student_funds_department ON student_funds(department_id);
CREATE INDEX idx_student_funds_branch ON student_funds(branch_id);
CREATE INDEX idx_student_funds_status ON student_funds(payment_status);
CREATE INDEX idx_student_funds_student_id ON student_funds(student_id);
CREATE INDEX idx_fund_collections_semester ON fund_collections(semester_id);
CREATE INDEX idx_fund_collections_department ON fund_collections(department_id);
CREATE INDEX idx_fund_collections_branch ON fund_collections(branch_id);

-- Trigger to update collection summary
CREATE OR REPLACE FUNCTION update_fund_collections()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert collection summary
    INSERT INTO fund_collections (
        semester_id,
        department_id,
        branch_id,
        total_students,
        total_fund_required,
        total_fund_collected,
        updated_at
    )
    SELECT 
        NEW.semester_id,
        NEW.department_id,
        NEW.branch_id,
        COUNT(*) as total_students,
        SUM(fund_amount) as total_fund_required,
        SUM(paid_amount) as total_fund_collected,
        CURRENT_TIMESTAMP
    FROM student_funds
    WHERE 
        (semester_id = NEW.semester_id OR (NEW.semester_id IS NULL AND semester_id IS NULL))
        AND (department_id = NEW.department_id OR (NEW.department_id IS NULL AND department_id IS NULL))
        AND (branch_id = NEW.branch_id OR (NEW.branch_id IS NULL AND branch_id IS NULL))
    GROUP BY semester_id, department_id, branch_id
    ON CONFLICT (semester_id, department_id, branch_id) 
    DO UPDATE SET
        total_students = EXCLUDED.total_students,
        total_fund_required = EXCLUDED.total_fund_required,
        total_fund_collected = EXCLUDED.total_fund_collected,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collections
AFTER INSERT OR UPDATE OF fund_amount, paid_amount, semester_id, department_id, branch_id
ON student_funds
FOR EACH ROW
EXECUTE FUNCTION update_fund_collections();

-- Repair statuses for records created before amount-based status validation.
UPDATE student_funds
SET payment_status = CASE
    WHEN fund_amount > 0 AND paid_amount >= fund_amount THEN 'paid'
    WHEN paid_amount > 0 THEN 'partial'
    ELSE 'pending'
END
WHERE payment_status IS DISTINCT FROM CASE
    WHEN fund_amount > 0 AND paid_amount >= fund_amount THEN 'paid'
    WHEN paid_amount > 0 THEN 'partial'
    ELSE 'pending'
END;

-- Insert initial data
INSERT INTO departments (name, code, description) VALUES
('Engineering', 'ENG', 'Engineering Department'),
('Diploma', 'DIP', 'Diploma Department'),
('Management', 'MGT', 'Management Department')
ON CONFLICT DO NOTHING;

INSERT INTO branches (department_id, name, code, description) VALUES
(1, 'Computer Science', 'CSE', 'Computer Science Engineering'),
(1, 'Electrical Engineering', 'EE', 'Electrical Engineering'),
(1, 'Civil Engineering', 'CE', 'Civil Engineering'),
(1, 'Mechanical Engineering', 'ME', 'Mechanical Engineering'),
(2, 'Computer Science', 'CSE-D', 'Diploma in Computer Science'),
(2, 'Electrical Engineering', 'EE-D', 'Diploma in Electrical Engineering'),
(2, 'Civil Engineering', 'CE-D', 'Diploma in Civil Engineering')
ON CONFLICT DO NOTHING;

INSERT INTO semesters (semester_number, name, description) VALUES
(3, 'Semester 3', 'Third Semester'),
(5, 'Semester 5', 'Fifth Semester'),
(7, 'Semester 7', 'Seventh Semester')
ON CONFLICT (semester_number) DO NOTHING;
