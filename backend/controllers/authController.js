import * as service from "../services.js";
import { sendJson, readBody } from "../utils/http.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const sessions = new Map();

export async function login(req, res) {
  try {
    const body = await readBody(req);
    const { email, password } = body;

    if (!email || !password) {
      sendJson(res, 400, { error: "Email and password are required" });
      return;
    }

    const user = await service.pickUserByEmail(email);
    if (!user || !user.password_hash) {
      sendJson(res, 401, { error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      sendJson(res, 401, { error: "Invalid email or password" });
      return;
    }

    const token = crypto.randomUUID();
    sessions.set(token, { userId: user.id, email: user.email });

    const { password_hash, ...safeUser } = user;
    sendJson(res, 200, { data: { token, user: safeUser } });
  } catch (err) {
    console.error("Login error:", err);
    sendJson(res, 500, { error: "Internal server error" });
  }
}

export function getUserFromToken(token) {
  return sessions.get(token) ?? null;
}

export function removeSession(token) {
  sessions.delete(token);
}
