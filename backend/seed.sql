-- TRACE demo seed data
-- Run in Supabase SQL Editor (after tables exist).
--
-- Works even if you created tables from the Supabase diagram without UNIQUE constraints.
-- Safe to re-run: skips rows that already exist.

/*
-- Optional: wipe demo data before a clean re-seed
truncate table teacher_notes cascade;
truncate table student_mistakes cascade;
truncate table questions cascade;
truncate table assessments cascade;
truncate table students cascade;
truncate table classes cascade;
delete from users where email like '%@trace.local';
*/

-- ---------------------------------------------------------------------------
-- Ensure indexes/constraints the app expects (no-op if already present)
-- ---------------------------------------------------------------------------
create unique index if not exists users_email_key on users (email);
create unique index if not exists students_student_number_key on students (student_number);
create unique index if not exists mistake_labels_label_name_key on mistake_labels (label_name);
create unique index if not exists questions_assessment_question_key on questions (assessment_id, question_number);
create unique index if not exists student_mistakes_student_question_key on student_mistakes (student_id, question_id);

-- Mistake labels (required for tagging)
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

-- ---------------------------------------------------------------------------
-- Users (teachers)
-- ---------------------------------------------------------------------------
insert into users (id, email, full_name, role)
select v.id, v.email, v.full_name, v.role
from (
  values
    ('a0000001-0000-4000-8000-000000000001'::uuid, 'teacher@trace.local', 'Demo Teacher', 'teacher'),
    ('a0000001-0000-4000-8000-000000000002'::uuid, 'maria.santos@trace.local', 'Maria Santos', 'teacher')
) as v(id, email, full_name, role)
where not exists (
  select 1 from users u where u.email = v.email
);

-- ---------------------------------------------------------------------------
-- Classes
-- ---------------------------------------------------------------------------
insert into classes (id, class_name, subject, teacher_id)
select v.id, v.class_name, v.subject, u.id
from (
  values
    ('b0000001-0000-4000-8000-000000000001'::uuid, 'BSCE SC123 - Calculus 1', 'Calculus 1'),
    ('b0000001-0000-4000-8000-000000000002'::uuid, 'BSIT SC221 - Calculus 1', 'Calculus 1'),
    ('b0000001-0000-4000-8000-000000000003'::uuid, 'BSMath SC102 - Calculus 1', 'Calculus 1')
) as v(id, class_name, subject)
cross join lateral (
  select id from users where email = 'teacher@trace.local' limit 1
) u
where not exists (
  select 1 from classes c where c.class_name = v.class_name
);

-- ---------------------------------------------------------------------------
-- Students (Maria = 2026-002 powers the student portal)
-- ---------------------------------------------------------------------------
insert into students (id, student_number, full_name, class_id)
select v.id, v.student_number, v.full_name, c.id
from (
  values
    ('c0000001-0000-4000-8000-000000000001'::uuid, '2026-001', 'Juan Dela Cruz', 'BSCE SC123 - Calculus 1'),
    ('c0000001-0000-4000-8000-000000000002'::uuid, '2026-002', 'Maria Santos', 'BSIT SC221 - Calculus 1'),
    ('c0000001-0000-4000-8000-000000000003'::uuid, '2026-003', 'Alex Rivera', 'BSCE SC123 - Calculus 1'),
    ('c0000001-0000-4000-8000-000000000004'::uuid, '2026-004', 'Leah Fernandez', 'BSIT SC221 - Calculus 1'),
    ('c0000001-0000-4000-8000-000000000005'::uuid, '2026-005', 'Noah Garcia', 'BSIT SC221 - Calculus 1'),
    ('c0000001-0000-4000-8000-000000000006'::uuid, '2026-006', 'Sofia Mendoza', 'BSMath SC102 - Calculus 1'),
    ('c0000001-0000-4000-8000-000000000007'::uuid, '2026-007', 'Ethan Lim', 'BSMath SC102 - Calculus 1')
) as v(id, student_number, full_name, class_name)
join classes c on c.class_name = v.class_name
where not exists (
  select 1 from students s where s.student_number = v.student_number
);

-- ---------------------------------------------------------------------------
-- Assessments
-- ---------------------------------------------------------------------------
insert into assessments (id, title, class_id, status, created_at)
select v.id, v.title, c.id, v.status, v.created_at
from (
  values
    ('d0000001-0000-4000-8000-000000000001'::uuid, 'Midterm Exam 1', 'BSIT SC221 - Calculus 1', 'reviewed', '2026-03-18 09:00:00+00'::timestamptz),
    ('d0000001-0000-4000-8000-000000000002'::uuid, 'Quiz 2', 'BSCE SC123 - Calculus 1', 'reviewed', '2026-03-14 09:00:00+00'::timestamptz),
    ('d0000001-0000-4000-8000-000000000003'::uuid, 'Integration Drill', 'BSMath SC102 - Calculus 1', 'pending', '2026-03-10 09:00:00+00'::timestamptz)
) as v(id, title, class_name, status, created_at)
join classes c on c.class_name = v.class_name
where not exists (
  select 1
  from assessments a
  join classes c2 on c2.id = a.class_id
  where a.title = v.title and c2.class_name = v.class_name
);

-- ---------------------------------------------------------------------------
-- Questions
-- ---------------------------------------------------------------------------
insert into questions (id, assessment_id, question_number, question_text, topic)
select v.id, a.id, v.question_number, v.question_text, v.topic
from (
  values
    ('e0000001-0000-4000-8000-000000000001'::uuid, 'Midterm Exam 1', 1, 'Differentiate f(x) = 5x^4 - 3x^2 + 7', 'Power Rule'),
    ('e0000001-0000-4000-8000-000000000002'::uuid, 'Midterm Exam 1', 2, 'Differentiate g(x) = (3x^2 + 1)^5', 'Chain Rule'),
    ('e0000001-0000-4000-8000-000000000003'::uuid, 'Midterm Exam 1', 3, 'Differentiate h(x) = (x^2 + 3)(2x - 1)', 'Product Rule'),
    ('e0000001-0000-4000-8000-000000000004'::uuid, 'Midterm Exam 1', 4, 'Evaluate ∫(4x^3 - 6x + 2) dx', 'Integration'),
    ('e0000001-0000-4000-8000-000000000005'::uuid, 'Quiz 2', 1, 'Find lim x→2 (x^2 - 4)/(x - 2)', 'Limits'),
    ('e0000001-0000-4000-8000-000000000006'::uuid, 'Quiz 2', 2, 'Differentiate y = sin(4x^2)', 'Chain Rule'),
    ('e0000001-0000-4000-8000-000000000007'::uuid, 'Quiz 2', 3, 'Evaluate ∫(2x + 1) dx', 'Integration'),
    ('e0000001-0000-4000-8000-000000000008'::uuid, 'Integration Drill', 1, 'Evaluate ∫2x(x^2 + 1)^4 dx', 'U-Substitution'),
    ('e0000001-0000-4000-8000-000000000009'::uuid, 'Integration Drill', 2, 'Evaluate ∫5x^4 dx', 'Power Rule'),
    ('e0000001-0000-4000-8000-000000000010'::uuid, 'Integration Drill', 3, 'Approximate area under y = x^2 from 0 to 2', 'Area Under Curve')
) as v(id, assessment_title, question_number, question_text, topic)
join assessments a on a.title = v.assessment_title
where not exists (
  select 1
  from questions q
  where q.assessment_id = a.id and q.question_number = v.question_number
);

-- ---------------------------------------------------------------------------
-- Student mistakes
-- ---------------------------------------------------------------------------
insert into student_mistakes (student_id, question_id, mistake_label_id, teacher_note)
select s.id, q.id, ml.id, v.teacher_note
from (
  values
    ('2026-002', 'Midterm Exam 1', 2, 'Procedural Mistake', 'Forgot to apply the derivative of the inner function.'),
    ('2026-002', 'Midterm Exam 1', 1, 'Sign Error', 'Coefficient sign flipped during differentiation.'),
    ('2026-002', 'Midterm Exam 1', 4, 'Calculation Error', 'Sign error during simplification.'),
    ('2026-001', 'Midterm Exam 1', 2, 'Procedural Mistake', 'Missed the inner derivative after applying the chain rule.'),
    ('2026-003', 'Midterm Exam 1', 2, 'Conceptual Misunderstanding', 'Treated the inner function as constant.'),
    ('2026-004', 'Midterm Exam 1', 3, 'Procedural Mistake', 'Differentiated only one factor in the product rule.'),
    ('2026-005', 'Midterm Exam 1', 2, 'Procedural Mistake', 'Chain rule setup incomplete.'),
    ('2026-005', 'Midterm Exam 1', 4, 'Calculation Error', 'Lost constant of integration.'),
    ('2026-001', 'Quiz 2', 2, 'Procedural Mistake', 'Did not multiply by the derivative of the inner function.'),
    ('2026-003', 'Quiz 2', 2, 'Sign Error', 'Sign dropped when differentiating sine composite.'),
    ('2026-006', 'Integration Drill', 1, 'Conceptual Misunderstanding', 'Did not identify the composite function correctly.'),
    ('2026-007', 'Integration Drill', 1, 'Procedural Mistake', 'Substitution setup started but not carried through.')
) as v(student_number, assessment_title, question_number, label_name, teacher_note)
join students s on s.student_number = v.student_number
join assessments a on a.title = v.assessment_title
join questions q on q.assessment_id = a.id and q.question_number = v.question_number
join mistake_labels ml on ml.label_name = v.label_name
where not exists (
  select 1
  from student_mistakes sm
  where sm.student_id = s.id and sm.question_id = q.id
);

-- ---------------------------------------------------------------------------
-- Teacher notes
-- ---------------------------------------------------------------------------
insert into teacher_notes (assessment_id, question_id, note_text)
select a.id, q.id, v.note_text
from (
  values
    ('Midterm Exam 1', 2, 'Many students forgot to multiply by the derivative of the inner function when applying the chain rule.'),
    ('Midterm Exam 1', 4, 'Students handled the main antiderivative correctly but lost constants and signs during integration.'),
    ('Quiz 2', 2, 'Several answers missed the derivative of the inner function or treated 4x^2 as a constant.'),
    ('Integration Drill', 1, 'Students set up the substitution but failed to carry the change of variables through consistently.')
) as v(assessment_title, question_number, note_text)
join assessments a on a.title = v.assessment_title
join questions q on q.assessment_id = a.id and q.question_number = v.question_number
where not exists (
  select 1
  from teacher_notes tn
  where tn.assessment_id = a.id
    and tn.question_id = q.id
    and tn.note_text = v.note_text
);

-- ---------------------------------------------------------------------------
-- Verification
-- ---------------------------------------------------------------------------
select 'users' as table_name, count(*) as row_count from users
union all select 'classes', count(*) from classes
union all select 'students', count(*) from students
union all select 'assessments', count(*) from assessments
union all select 'questions', count(*) from questions
union all select 'mistake_labels', count(*) from mistake_labels
union all select 'student_mistakes', count(*) from student_mistakes
union all select 'teacher_notes', count(*) from teacher_notes
order by table_name;
