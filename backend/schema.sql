-- Run this in Supabase SQL editor for the prototype backend.
create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null,
  created_at timestamptz not null default now()
);

create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  class_name text not null,
  subject text not null,
  teacher_id uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  student_number text not null unique,
  full_name text not null,
  class_id uuid not null references classes(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  class_id uuid not null references classes(id) on delete cascade,
  exam_file_url text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  question_number int4 not null,
  question_text text not null,
  topic text not null,
  created_at timestamptz not null default now(),
  unique (assessment_id, question_number)
);

create table if not exists mistake_labels (
  id uuid primary key default gen_random_uuid(),
  label_name text not null unique
);

create table if not exists student_mistakes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  mistake_label_id uuid not null references mistake_labels(id) on delete restrict,
  teacher_note text,
  created_at timestamptz not null default now(),
  unique (student_id, question_id)
);

create table if not exists teacher_notes (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  note_text text not null,
  created_at timestamptz not null default now()
);

insert into mistake_labels (label_name)
select label_name
from (
  values
    ('Conceptual Misunderstanding'),
    ('Procedural Mistake'),
    ('Calculation Error'),
    ('Sign Error'),
    ('Interpretation Mistake'),
    ('Careless Mistake')
) as v(label_name)
where not exists (
  select 1 from mistake_labels ml where ml.label_name = v.label_name
);

-- Required for creating classes (classes.teacher_id -> users.id)
insert into users (email, full_name, role)
select 'teacher@trace.local', 'Demo Teacher', 'teacher'
where not exists (
  select 1 from users where email = 'teacher@trace.local'
);

-- Full demo dataset: run backend/seed.sql in the Supabase SQL editor after this file.