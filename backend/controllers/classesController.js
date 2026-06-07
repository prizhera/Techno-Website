import * as service from "../services.js";
import { sendJson, readBody, badRequest, notFound } from "../utils/http.js";

export async function list(req, res) {
  sendJson(res, 200, { data: await service.listClasses() });
}

export async function create(req, res) {
  const body = await readBody(req);
  const className = body.class_name?.trim();
  const subject = body.subject?.trim();
  let teacherId = body.teacher_id;

  if (!teacherId) {
    const defaultTeacher = await service.pickDefaultTeacher();
    teacherId = defaultTeacher?.id;
  }

  if (!className || !subject || !teacherId) {
    badRequest(
      res,
      "class_name, subject, and teacher_id are required. Add at least one teacher row in the users table."
    );
    return;
  }

  sendJson(res, 201, {
    data: await service.createClass({
      class_name: className,
      subject,
      teacher_id: teacherId,
    }),
  });
}

export async function getById(req, res, pathname) {
  const classId = pathname.split("/")[3];
  const classRecord = await service.pickClassById(classId);
  if (!classRecord) {
    notFound(res);
    return;
  }

  sendJson(res, 200, { data: classRecord });
}

export async function update(req, res, pathname) {
  try {
    const id = pathname.split("/")[3];
    const body = await readBody(req);
    const record = await service.updateClass(id, body);
    if (!record) {
      notFound(res);
      return;
    }
    sendJson(res, 200, { data: record });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to update class" });
  }
}

export async function remove(req, res, pathname) {
  try {
    const id = pathname.split("/")[3];
    const record = await service.pickClassById(id);
    if (!record) {
      notFound(res);
      return;
    }
    await service.deleteClass(id);
    sendJson(res, 200, { success: true });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to delete class" });
  }
}
