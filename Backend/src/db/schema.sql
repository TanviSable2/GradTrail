CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'student'
                  CHECK (role IN ('student', 'admin')),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name      TEXT,
    last_name       TEXT,
    branch          TEXT NOT NULL,
    year            INTEGER,
    location        TEXT,
    skills          TEXT[],
    resume_url      TEXT,
    resume_filename TEXT,
    about           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS jobs (
    id              SERIAL PRIMARY KEY,
    source          TEXT NOT NULL,
    external_id     TEXT,
    title           TEXT NOT NULL,
    company         TEXT NOT NULL,
    role            TEXT NOT NULL,
    job_type        TEXT NOT NULL CHECK (job_type IN ('internship', 'job', 'course')),
    employment_type TEXT DEFAULT 'any' CHECK (employment_type IN ('any', 'full-time', 'part-time', 'temporary', 'remote', 'contract')),
    description     TEXT,
    branch_hint     TEXT[],
    skills_hint     TEXT[],
    domain          TEXT,
    location        TEXT,
    is_remote       BOOLEAN DEFAULT FALSE,
    country         TEXT DEFAULT 'India',
    salary_min      NUMERIC,
    salary_max      NUMERIC,
    salary_period   TEXT DEFAULT 'yearly' CHECK (salary_period IN ('monthly', 'yearly')),
    apply_url       TEXT NOT NULL,
    posted_at       TIMESTAMP,
    deadline        TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT jobs_source_external_unique UNIQUE (source, external_id)
);

CREATE TABLE IF NOT EXISTS applications (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id                  INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status                  TEXT NOT NULL DEFAULT 'not_applied'
                            CHECK (status IN ('not_applied','applied','interview','rejected','offer')),
    referral_name           TEXT,
    referral_link           TEXT,
    reminder_date           TIMESTAMP,
    notes                   TEXT,
    remind_me               BOOLEAN DEFAULT FALSE,
    remind_days_before      INTEGER DEFAULT 3,
    deadline_reminder_sent  BOOLEAN DEFAULT FALSE,
    interview_reminder_sent BOOLEAN DEFAULT FALSE,
    interview_date          TIMESTAMP WITH TIME ZONE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS certifications (
    id               SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    issuing_org      TEXT,
    url              TEXT,
    skills           TEXT[],
    completion_date  DATE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sync_log (
    id           SERIAL PRIMARY KEY,
    source       TEXT NOT NULL UNIQUE,
    last_synced  TIMESTAMP,
    total_jobs   INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_profiles_branch      ON profiles(branch);
CREATE INDEX IF NOT EXISTS idx_profiles_skills      ON profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type        ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_location        ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_deadline        ON jobs(deadline);
CREATE INDEX IF NOT EXISTS idx_jobs_branch_hint     ON jobs USING GIN (branch_hint);
CREATE INDEX IF NOT EXISTS idx_jobs_skills_hint     ON jobs USING GIN (skills_hint);
CREATE INDEX IF NOT EXISTS idx_jobs_is_remote       ON jobs(is_remote);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at       ON jobs(posted_at);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_domain          ON jobs(domain);
CREATE INDEX IF NOT EXISTS idx_jobs_company_name    ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_apps_user_id         ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_status          ON applications(status);
CREATE INDEX IF NOT EXISTS idx_apps_reminder        ON applications(reminder_date);
CREATE INDEX IF NOT EXISTS idx_certs_skills         ON certifications USING GIN (skills);