# Technoweb Monorepo

The project is split into two folders:

- `backend/` contains the HTTP API.
- Root contains the Next.js app.

## Major Feature Modules

- Backend API server: `backend/server.js`
- Backend Supabase data layer: `backend/services.js`
- Backend Supabase client: `backend/supabase.js`
- Supabase schema script: `backend/schema.sql`
- Frontend API helper: `lib/api.ts`

## Required Environment Variables

Create `backend/.env` from `backend/.env.example` and fill:

- `PORT=4000`
- `SUPABASE_URL=<your-supabase-project-url>`
- `SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>`
- `FRONTEND_URL=http://localhost:3000`

Create `.env.local` from `.env.example`:

- `NEXT_PUBLIC_API_URL=http://localhost:4000`

Important: use service role key only in backend `.env`, never in frontend.

## Supabase Setup (One-Time)

1. Open Supabase SQL editor.
2. Run `backend/schema.sql`.
3. Insert at least one teacher row into `users`.
4. Use that `users.id` as `teacher_id` when creating classes.

## Run the frontend

```bash
npm install
npm run dev
```

## Run the backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:4000` by default.

## Backend endpoints

- `GET /health`
- `GET /api/dashboard`
- `GET /api/analytics`
- `GET /api/classes`
- `POST /api/classes`
- `GET /api/students`
- `POST /api/students`
- `POST /api/students/bulk`
- `GET /api/assessments`
- `POST /api/assessments`
- `GET /api/questions`
- `POST /api/questions`
- `GET /api/mistake-labels`
- `POST /api/mistake-labels`
- `GET /api/student-mistakes`
- `POST /api/student-mistakes`
- `GET /api/question-mistakes`
- `POST /api/question-mistake-batch`
- `GET /api/teacher-notes`
- `POST /api/teacher-notes`
- `GET /api/analytics/assessment/:assessmentId`
- `GET /api/students/:studentId/insights`

## Quick Test Payloads

Create class (`POST /api/classes`):

```json
{
	"class_name": "BSCE SC123",
	"subject": "Calculus 1",
	"teacher_id": "<uuid-from-users-table>"
}
```

Create student (`POST /api/students`):

```json
{
	"student_number": "2026-001",
	"full_name": "Juan Dela Cruz",
	"class_id": "<uuid-from-classes-table>"
}
```

Create assessment (`POST /api/assessments`):

```json
{
	"title": "Midterm Exam 1",
	"class_id": "<uuid-from-classes-table>",
	"status": "pending"
}
```

Bulk add students (`POST /api/students/bulk`):

```json
{
	"class_id": "<uuid-from-classes-table>",
	"students": [
		{ "student_number": "2026-001", "full_name": "Juan Dela Cruz" },
		{ "student_number": "2026-002", "full_name": "Maria Santos" }
	]
}
```

Create question (`POST /api/questions`):

```json
{
	"assessment_id": "<uuid-from-assessments-table>",
	"question_number": 1,
	"question_text": "Differentiate f(x) = 5x^4 - 3x^2 + 7",
	"topic": "Power Rule"
}
```

Create student mistake (`POST /api/student-mistakes`):

```json
{
	"student_id": "<uuid-from-students-table>",
	"question_id": "<uuid-from-questions-table>",
	"mistake_label_id": "<uuid-from-mistake_labels-table>",
	"teacher_note": "Forgot inner derivative"
}
```

Batch tag wrong students per question (`POST /api/question-mistake-batch`):

```json
{
	"question_id": "<uuid-from-questions-table>",
	"mistake_label_id": "<uuid-from-mistake_labels-table>",
	"student_ids": [
		"<uuid-student-1>",
		"<uuid-student-2>",
		"<uuid-student-3>"
	],
	"teacher_note": "Many students used product rule instead of chain rule"
}
```

Create teacher note (`POST /api/teacher-notes`):

```json
{
	"assessment_id": "<uuid-from-assessments-table>",
	"question_id": "<optional-uuid-from-questions-table>",
	"note_text": "Most errors were from algebraic simplification after differentiation"
}
```

Assessment question analytics summary (`GET /api/analytics/assessment/:assessmentId`) returns:

- question-level incorrect counts
- unique students affected per question
- mistake distribution per question

Student insights (`GET /api/students/:studentId/insights`) returns:

- categorized recurring mistakes
- detailed mistake history with linked question, assessment, and class metadata
