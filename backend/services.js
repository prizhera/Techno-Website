import { supabase } from "./supabase.js";

async function withRows(query) {
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function singleRow(query) {
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? null;
}

async function listDashboard() {
  const [classes, students, assessments, questions, mistakeLabels, studentMistakes] = await Promise.all([
    withRows(supabase.from("classes").select("id, class_name, subject, teacher_id, created_at")),
    withRows(supabase.from("students").select("id, student_number, full_name, class_id, created_at")),
    withRows(supabase.from("assessments").select("id, title, class_id, exam_file_url, status, created_at")),
    withRows(supabase.from("questions").select("id, assessment_id, question_number, question_text, topic, created_at")),
    withRows(supabase.from("mistake_labels").select("id, label_name")),
    withRows(supabase.from("student_mistakes").select("id, student_id, question_id, mistake_label_id, teacher_note, created_at")),
  ]);

  const reviewedAssessments = assessments.filter((assessment) => assessment.status === "reviewed").length;
  const supportStudents = new Set(studentMistakes.map((row) => row.student_id)).size;

  return {
    metrics: {
      classes: classes.length,
      assessments: assessments.length,
      reviewedAssessments,
      supportStudents,
    },
    classes,
    assessments,
    students,
    questions,
    mistake_labels: mistakeLabels,
    student_mistakes: studentMistakes,
  };
}

async function listClasses() {
  const classes = await withRows(
    supabase.from("classes").select("id, class_name, subject, teacher_id, created_at").order("class_name", { ascending: true })
  );
  const students = await withRows(
    supabase.from("students").select("id, student_number, full_name, class_id, created_at").order("full_name", { ascending: true })
  );
  const assessments = await withRows(
    supabase.from("assessments").select("id, title, class_id, exam_file_url, status, created_at").order("title", { ascending: true })
  );

  return classes.map((classItem) => ({
    ...classItem,
    students: students.filter((student) => student.class_id === classItem.id),
    assessments: assessments.filter((assessment) => assessment.class_id === classItem.id),
  }));
}

async function createClass(payload) {
  return singleRow(
    supabase
      .from("classes")
      .insert({
        class_name: payload.class_name,
        subject: payload.subject,
        teacher_id: payload.teacher_id,
      })
      .select("id, class_name, subject, teacher_id, created_at")
      .single()
  );
}

async function pickClassById(classId) {
  return singleRow(
    supabase.from("classes").select("id, class_name, subject, teacher_id, created_at").eq("id", classId).maybeSingle()
  );
}

async function listStudents(classId) {
  const query = supabase
    .from("students")
    .select("id, student_number, full_name, class_id, created_at")
    .order("full_name", { ascending: true });
  return withRows(classId ? query.eq("class_id", classId) : query);
}

async function createStudent(payload) {
  return singleRow(
    supabase
      .from("students")
      .insert({
        student_number: payload.student_number,
        full_name: payload.full_name,
        class_id: payload.class_id,
      })
      .select("id, student_number, full_name, class_id, created_at")
      .single()
  );
}

async function createStudentsBulk(payload) {
  const rows = (payload.students ?? []).map((student) => ({
    student_number: student.student_number,
    full_name: student.full_name,
    class_id: payload.class_id,
  }));

  if (!rows.length) {
    return [];
  }

  return withRows(
    supabase
      .from("students")
      .insert(rows)
      .select("id, student_number, full_name, class_id, created_at")
  );
}

async function listAssessments(classId) {
  const query = supabase
    .from("assessments")
    .select("id, title, class_id, exam_file_url, status, created_at")
    .order("title", { ascending: true });
  return withRows(classId ? query.eq("class_id", classId) : query);
}

async function createAssessment(payload) {
  return singleRow(
    supabase
      .from("assessments")
      .insert({
        title: payload.title,
        class_id: payload.class_id,
        exam_file_url: payload.exam_file_url ?? null,
        status: payload.status ?? "pending",
      })
      .select("id, title, class_id, exam_file_url, status, created_at")
      .single()
  );
}

async function listQuestions(assessmentId) {
  const query = supabase
    .from("questions")
    .select("id, assessment_id, question_number, question_text, topic, created_at")
    .order("question_number", { ascending: true });
  return withRows(assessmentId ? query.eq("assessment_id", assessmentId) : query);
}

async function createQuestion(payload) {
  return singleRow(
    supabase
      .from("questions")
      .insert({
        assessment_id: payload.assessment_id,
        question_number: payload.question_number,
        question_text: payload.question_text,
        topic: payload.topic,
      })
      .select("id, assessment_id, question_number, question_text, topic, created_at")
      .single()
  );
}

async function createQuestionsBulk(assessmentId, questions) {
  const rows = questions.map((q) => ({
    assessment_id: assessmentId,
    question_number: q.question_number,
    question_text: q.question_text,
    topic: q.topic || "General",
  }));

  if (!rows.length) return [];

  return withRows(
    supabase.from("questions").insert(rows).select("id, assessment_id, question_number, question_text, topic, created_at")
  );
}

async function listMistakeLabels() {
  return withRows(supabase.from("mistake_labels").select("id, label_name").order("label_name", { ascending: true }));
}

async function createMistakeLabel(payload) {
  return singleRow(
    supabase.from("mistake_labels").insert({ label_name: payload.label_name }).select("id, label_name").single()
  );
}

async function listStudentMistakes(studentId) {
  const query = supabase
    .from("student_mistakes")
    .select("id, student_id, question_id, mistake_label_id, teacher_note, created_at");
  return withRows(studentId ? query.eq("student_id", studentId) : query);
}

async function createStudentMistake(payload) {
  return singleRow(
    supabase
      .from("student_mistakes")
      .insert({
        student_id: payload.student_id,
        question_id: payload.question_id,
        mistake_label_id: payload.mistake_label_id,
        teacher_note: payload.teacher_note ?? "",
      })
      .select("id, student_id, question_id, mistake_label_id, teacher_note, created_at")
      .single()
  );
}

async function createQuestionMistakeBatch(payload) {
  const studentIds = Array.isArray(payload.student_ids) ? payload.student_ids : [];
  if (!studentIds.length) {
    return [];
  }

  const rows = studentIds.map((studentId) => ({
    student_id: studentId,
    question_id: payload.question_id,
    mistake_label_id: payload.mistake_label_id,
    teacher_note: payload.teacher_note ?? "",
  }));

  return withRows(
    supabase
      .from("student_mistakes")
      .upsert(rows, { onConflict: "student_id,question_id" })
      .select("id, student_id, question_id, mistake_label_id, teacher_note, created_at")
  );
}

async function listQuestionMistakes(questionId) {
  const base = supabase
    .from("student_mistakes")
    .select("id, student_id, question_id, mistake_label_id, teacher_note, created_at");

  if (!questionId) {
    return withRows(base);
  }

  return withRows(base.eq("question_id", questionId));
}

async function listTeacherNotes(filters = {}) {
  let query = supabase
    .from("teacher_notes")
    .select("id, assessment_id, question_id, note_text, created_at")
    .order("created_at", { ascending: false });

  if (filters.assessment_id) {
    query = query.eq("assessment_id", filters.assessment_id);
  }

  if (filters.question_id) {
    query = query.eq("question_id", filters.question_id);
  }

  return withRows(query);
}

async function createTeacherNote(payload) {
  return singleRow(
    supabase
      .from("teacher_notes")
      .insert({
        assessment_id: payload.assessment_id,
        question_id: payload.question_id ?? null,
        note_text: payload.note_text,
      })
      .select("id, assessment_id, question_id, note_text, created_at")
      .single()
  );
}

async function listAnalytics() {
  const [classes, students, assessments, questions, labels, studentMistakes] = await Promise.all([
    withRows(supabase.from("classes").select("id")),
    withRows(supabase.from("students").select("id")),
    withRows(supabase.from("assessments").select("id, status")),
    withRows(supabase.from("questions").select("id, question_number, topic")),
    withRows(supabase.from("mistake_labels").select("id, label_name")),
    withRows(supabase.from("student_mistakes").select("id, question_id, mistake_label_id")),
  ]);

  const questionMistakeCounts = questions.map((question) => ({
    question_id: question.id,
    question_number: question.question_number,
    topic: question.topic,
    incorrect_count: studentMistakes.filter((row) => row.question_id === question.id).length,
  }));

  const labelCounts = labels.map((label) => ({
    mistake_label_id: label.id,
    label_name: label.label_name,
    count: studentMistakes.filter((row) => row.mistake_label_id === label.id).length,
  }));

  return {
    classes: classes.length,
    students: students.length,
    assessments: assessments.length,
    questions: questions.length,
    labelCounts,
    questionMistakeCounts,
  };
}

async function listAssessmentQuestionSummary(assessmentId) {
  const assessment = await pickAssessmentById(assessmentId);
  if (!assessment) {
    return null;
  }

  const questions = await withRows(
    supabase
      .from("questions")
      .select("id, assessment_id, question_number, question_text, topic")
      .eq("assessment_id", assessmentId)
      .order("question_number", { ascending: true })
  );

  if (!questions.length) {
    return {
      assessment,
      questions: [],
    };
  }

  const questionIds = questions.map((question) => question.id);
  const [mistakes, labels] = await Promise.all([
    withRows(
      supabase
        .from("student_mistakes")
        .select("id, student_id, question_id, mistake_label_id")
        .in("question_id", questionIds)
    ),
    withRows(supabase.from("mistake_labels").select("id, label_name")),
  ]);

  const labelMap = new Map(labels.map((label) => [label.id, label.label_name]));

  const questionSummaries = questions.map((question) => {
    const rows = mistakes.filter((row) => row.question_id === question.id);
    const mistakeByLabel = new Map();

    for (const row of rows) {
      const labelName = labelMap.get(row.mistake_label_id) ?? "Unknown";
      mistakeByLabel.set(labelName, (mistakeByLabel.get(labelName) ?? 0) + 1);
    }

    return {
      ...question,
      incorrect_count: rows.length,
      unique_students_affected: new Set(rows.map((row) => row.student_id)).size,
      mistake_distribution: Array.from(mistakeByLabel.entries()).map(([label_name, count]) => ({
        label_name,
        count,
      })),
    };
  });

  const aiInsightMap = await listAiInsights(questionIds);

  const questionsWithAiInsights = questionSummaries.map((q) => ({
    ...q,
    ai_insight: aiInsightMap[q.id] ?? null,
  }));

  return {
    assessment,
    questions: questionsWithAiInsights,
  };
}

async function listAssessmentItemAnalysis(assessmentId) {
  const assessment = await pickAssessmentById(assessmentId);
  if (!assessment) return null;

  const questions = await withRows(
    supabase
      .from("questions")
      .select("id, assessment_id, question_number, question_text, topic")
      .eq("assessment_id", assessmentId)
      .order("question_number", { ascending: true })
  );

  if (!questions.length) {
    return { assessment, total_students: 0, items: [] };
  }

  const questionIds = questions.map((q) => q.id);
  const [mistakes, labels, students] = await Promise.all([
    withRows(
      supabase
        .from("student_mistakes")
        .select("id, student_id, question_id, mistake_label_id")
        .in("question_id", questionIds)
    ),
    withRows(supabase.from("mistake_labels").select("id, label_name")),
    withRows(supabase.from("students").select("id").eq("class_id", assessment.class_id)),
  ]);

  const totalStudents = students.length;
  const labelMap = new Map(labels.map((l) => [l.id, l.label_name]));

  const studentMistakeCount = new Map();
  for (const row of mistakes) {
    studentMistakeCount.set(row.student_id, (studentMistakeCount.get(row.student_id) ?? 0) + 1);
  }

  const sortedStudents = [...studentMistakeCount.entries()].sort((a, b) => a[1] - b[1]);
  const topCount = Math.ceil(sortedStudents.length / 3);
  const bottomCount = Math.ceil(sortedStudents.length / 3);
  const topGroup = new Set(sortedStudents.slice(0, topCount).map(([id]) => id));
  const bottomGroup = new Set(sortedStudents.slice(-bottomCount).map(([id]) => id));

  const items = questions.map((question) => {
    const rows = mistakes.filter((row) => row.question_id === question.id);
    const incorrectCount = rows.length;
    const difficultyIndex = totalStudents > 0 ? incorrectCount / totalStudents : 0;

    const topWrong = rows.filter((r) => topGroup.has(r.student_id)).length;
    const bottomWrong = rows.filter((r) => bottomGroup.has(r.student_id)).length;
    const discriminationIndex =
      topCount > 0 && bottomCount > 0
        ? (bottomWrong / bottomCount - topWrong / topCount)
        : 0;

    const mistakeByLabel = new Map();
    for (const row of rows) {
      const labelName = labelMap.get(row.mistake_label_id) ?? "Unknown";
      mistakeByLabel.set(labelName, (mistakeByLabel.get(labelName) ?? 0) + 1);
    }

    const distractorEntries = Array.from(mistakeByLabel.entries()).map(([label_name, count]) => ({
      label_name,
      count,
    }));

    const flags = [];
    if (difficultyIndex > 0.8) flags.push("Very Difficult");
    else if (difficultyIndex > 0.6) flags.push("Difficult");
    if (discriminationIndex < 0.1 && incorrectCount > 0) flags.push("Low Discrimination");
    const topDistractor = distractorEntries.sort((a, b) => b.count - a.count)[0];
    if (topDistractor && topDistractor.count / incorrectCount > 0.5 && incorrectCount > 2) {
      flags.push("Dominant Distractor");
    }

    return {
      id: question.id,
      question_number: question.question_number,
      topic: question.topic,
      question_text: question.question_text,
      incorrect_count: incorrectCount,
      difficulty_index: Math.round(difficultyIndex * 100),
      difficulty_label:
        difficultyIndex > 0.8 ? "Very Difficult" :
        difficultyIndex > 0.6 ? "Difficult" :
        difficultyIndex > 0.3 ? "Moderate" : "Easy",
      discrimination_index: Math.round(discriminationIndex * 100) / 100,
      unique_students_affected: new Set(rows.map((r) => r.student_id)).size,
      mistake_distribution: distractorEntries,
      flags,
    };
  });

  return { assessment, total_students: totalStudents, items };
}

async function listAssessmentDistribution(assessmentId) {
  const assessment = await pickAssessmentById(assessmentId);
  if (!assessment) return null;

  const [questions, students] = await Promise.all([
    withRows(
      supabase
        .from("questions")
        .select("id")
        .eq("assessment_id", assessmentId)
    ),
    withRows(
      supabase.from("students").select("id").eq("class_id", assessment.class_id)
    ),
  ]);

  if (!questions.length || !students.length) {
    return { mean: 0, stdDev: 0, histogram: [], total_students: 0 };
  }

  const questionIds = questions.map((q) => q.id);
  const mistakes = await withRows(
    supabase
      .from("student_mistakes")
      .select("student_id")
      .in("question_id", questionIds)
  );

  const studentCounts = new Map();
  for (const row of mistakes) {
    studentCounts.set(row.student_id, (studentCounts.get(row.student_id) ?? 0) + 1);
  }

  const counts = students.map((s) => studentCounts.get(s.id) ?? 0);
  const n = counts.length;
  const mean = n > 0 ? counts.reduce((a, b) => a + b, 0) / n : 0;
  const variance = n > 0 ? counts.reduce((sum, c) => sum + (c - mean) ** 2, 0) / n : 0;
  const stdDev = Math.sqrt(variance);

  const maxCount = Math.max(...counts, 1);
  const numBins = Math.min(maxCount + 1, 12, n);
  const binSize = Math.max(1, Math.ceil((maxCount + 1) / numBins));
  const bins = Array.from({ length: numBins }, (_, i) => ({
    binStart: i * binSize,
    binEnd: (i + 1) * binSize - 1,
    count: 0,
  }));
  for (const c of counts) {
    const idx = Math.min(Math.floor(c / binSize), numBins - 1);
    bins[idx].count++;
  }

  return {
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    histogram: bins,
    total_students: n,
  };
}

async function listStudentInsight(studentId) {
  const student = await singleRow(
    supabase.from("students").select("id, student_number, full_name, class_id, created_at").eq("id", studentId).maybeSingle()
  );

  if (!student) {
    return null;
  }

  const [mistakes, labels, questions, assessments, classes] = await Promise.all([
    withRows(
      supabase
        .from("student_mistakes")
        .select("id, student_id, question_id, mistake_label_id, teacher_note, created_at")
        .eq("student_id", studentId)
    ),
    withRows(supabase.from("mistake_labels").select("id, label_name")),
    withRows(supabase.from("questions").select("id, assessment_id, question_number, question_text, topic")),
    withRows(supabase.from("assessments").select("id, title, class_id")),
    withRows(supabase.from("classes").select("id, class_name, subject")),
  ]);

  const labelMap = new Map(labels.map((item) => [item.id, item.label_name]));
  const questionMap = new Map(questions.map((item) => [item.id, item]));
  const assessmentMap = new Map(assessments.map((item) => [item.id, item]));
  const classMap = new Map(classes.map((item) => [item.id, item]));

  const byLabel = new Map();
  for (const row of mistakes) {
    const labelName = labelMap.get(row.mistake_label_id) ?? "Unknown";
    byLabel.set(labelName, (byLabel.get(labelName) ?? 0) + 1);
  }

  const detailedMistakes = mistakes.map((row) => {
    const question = questionMap.get(row.question_id) ?? null;
    const assessment = question ? assessmentMap.get(question.assessment_id) ?? null : null;
    const classRecord = assessment ? classMap.get(assessment.class_id) ?? null : null;

    return {
      ...row,
      mistake_label: labelMap.get(row.mistake_label_id) ?? "Unknown",
      question,
      assessment,
      class: classRecord,
    };
  });

  return {
    student,
    total_mistakes: mistakes.length,
    recurring_mistakes: Array.from(byLabel.entries())
      .map(([label_name, count]) => ({ label_name, count }))
      .sort((a, b) => b.count - a.count),
    mistake_history: detailedMistakes,
  };
}

async function pickAssessmentById(assessmentId) {
  return singleRow(
    supabase.from("assessments").select("id, title, class_id, exam_file_url, status, created_at").eq("id", assessmentId).maybeSingle()
  );
}

async function pickQuestionById(questionId) {
  return singleRow(
    supabase.from("questions").select("id, assessment_id, question_number, question_text, topic, created_at").eq("id", questionId).maybeSingle()
  );
}

async function pickMistakeLabelById(labelId) {
  return singleRow(supabase.from("mistake_labels").select("id, label_name").eq("id", labelId).maybeSingle());
}

async function pickUserByEmail(email) {
  return singleRow(
    supabase.from("login").select("*").eq("email", email).maybeSingle()
  );
}

async function listUsers(role) {
  let query = supabase.from("users").select("id, email, full_name, role, created_at").order("full_name");
  if (role) {
    query = query.eq("role", role);
  }
  return withRows(query);
}

async function pickDefaultTeacher() {
  const teachers = await listUsers("teacher");
  return teachers[0] ?? null;
}

async function updateClass(id, payload) {
  const updates = {};
  if (payload.class_name !== undefined) updates.class_name = payload.class_name;
  if (payload.subject !== undefined) updates.subject = payload.subject;
  return singleRow(
    supabase.from("classes").update(updates).eq("id", id).select("id, class_name, subject, teacher_id, created_at").single()
  );
}

async function deleteClass(id) {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

async function pickStudentById(id) {
  return singleRow(
    supabase.from("students").select("id, student_number, full_name, class_id, created_at").eq("id", id).maybeSingle()
  );
}

async function updateStudent(id, payload) {
  const updates = {};
  if (payload.student_number !== undefined) updates.student_number = payload.student_number;
  if (payload.full_name !== undefined) updates.full_name = payload.full_name;
  if (payload.class_id !== undefined) updates.class_id = payload.class_id;
  return singleRow(
    supabase.from("students").update(updates).eq("id", id).select("id, student_number, full_name, class_id, created_at").single()
  );
}

async function deleteStudent(id) {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

async function updateAssessment(id, payload) {
  const updates = {};
  if (payload.title !== undefined) updates.title = payload.title;
  if (payload.class_id !== undefined) updates.class_id = payload.class_id;
  if (payload.status !== undefined) updates.status = payload.status;
  if (payload.exam_file_url !== undefined) updates.exam_file_url = payload.exam_file_url;
  return singleRow(
    supabase.from("assessments").update(updates).eq("id", id).select("id, title, class_id, exam_file_url, status, created_at").single()
  );
}

async function deleteAssessment(id) {
  const { error } = await supabase.from("assessments").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

async function updateQuestion(id, payload) {
  const updates = {};
  if (payload.question_number !== undefined) updates.question_number = payload.question_number;
  if (payload.question_text !== undefined) updates.question_text = payload.question_text;
  if (payload.topic !== undefined) updates.topic = payload.topic;
  return singleRow(
    supabase.from("questions").update(updates).eq("id", id).select("id, assessment_id, question_number, question_text, topic, created_at").single()
  );
}

async function deleteQuestion(id) {
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

async function deleteMistakeLabel(id) {
  const { error } = await supabase.from("mistake_labels").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

async function updateQuestionAiInsight(questionId, aiInsight) {
  try {
    const { error } = await supabase
      .from("questions")
      .update({ ai_insight: aiInsight })
      .eq("id", questionId);

    if (error) {
      console.warn("Could not persist AI insight (ai_insight column may not exist):", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Could not persist AI insight:", err.message);
    return false;
  }
}

async function listAiInsights(questionIds) {
  if (!questionIds.length) return {};

  try {
    const { data, error } = await supabase
      .from("questions")
      .select("id, ai_insight")
      .in("id", questionIds);

    if (error) return {};

    const map = {};
    for (const row of data ?? []) {
      if (row.ai_insight) map[row.id] = row.ai_insight;
    }
    return map;
  } catch {
    return {};
  }
}

export {
  listDashboard,
  listClasses,
  createClass,
  updateClass,
  deleteClass,
  pickClassById,
  listStudents,
  createStudent,
  createStudentsBulk,
  updateStudent,
  deleteStudent,
  pickStudentById,
  listAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  listQuestions,
  createQuestion,
  createQuestionsBulk,
  updateQuestion,
  deleteQuestion,
  listMistakeLabels,
  createMistakeLabel,
  deleteMistakeLabel,
  listStudentMistakes,
  createStudentMistake,
  createQuestionMistakeBatch,
  listQuestionMistakes,
  listTeacherNotes,
  createTeacherNote,
  listAnalytics,
  listAssessmentQuestionSummary,
  listAssessmentItemAnalysis,
  listAssessmentDistribution,
  listStudentInsight,
  pickAssessmentById,
  pickQuestionById,
  pickMistakeLabelById,
  listUsers,
  pickUserByEmail,
  pickDefaultTeacher,
  updateQuestionAiInsight,
  listAiInsights,
};
