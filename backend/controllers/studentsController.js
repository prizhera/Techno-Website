import * as service from "../services.js";
import { sendJson, readBody, badRequest, notFound } from "../utils/http.js";

export async function list(req, res, requestUrl) {
  sendJson(res, 200, {
    data: await service.listStudents(requestUrl.searchParams.get("class_id") ?? undefined),
  });
}

export async function create(req, res) {
  const body = await readBody(req);
  if (!body.student_number || !body.full_name || !body.class_id) {
    badRequest(res, "student_number, full_name, and class_id are required");
    return;
  }

  sendJson(res, 201, { data: await service.createStudent(body) });
}

export async function bulkCreate(req, res) {
  const body = await readBody(req);
  const students = Array.isArray(body.students) ? body.students : [];

  if (!body.class_id || !students.length) {
    badRequest(res, "class_id and a non-empty students array are required");
    return;
  }

  const invalidStudent = students.find((student) => !student.student_number || !student.full_name);
  if (invalidStudent) {
    badRequest(res, "each student requires student_number and full_name");
    return;
  }

  sendJson(res, 201, { data: await service.createStudentsBulk(body) });
}

export async function update(req, res, pathname) {
  try {
    const id = pathname.split("/")[3];
    const body = await readBody(req);
    const record = await service.updateStudent(id, body);
    if (!record) {
      notFound(res);
      return;
    }
    sendJson(res, 200, { data: record });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to update student" });
  }
}

export async function remove(req, res, pathname) {
  try {
    const id = pathname.split("/")[3];
    const record = await service.pickStudentById(id);
    if (!record) {
      notFound(res);
      return;
    }
    await service.deleteStudent(id);
    sendJson(res, 200, { success: true });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to delete student" });
  }
}
