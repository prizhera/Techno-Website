// Run with: node scripts/seed-user.js
// Creates a record in the `login` table with a bcrypt-hashed password.
// The login table should have: id, email, password_hash, created_at

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const email = process.argv[2] || "admin@trace.app";
const password = process.argv[3] || "admin123";

const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);

const { data, error } = await supabase
  .from("login")
  .upsert({ email, password_hash: passwordHash })
  .select("id, email")
  .single();

if (error) {
  console.error("Failed to create login:", error.message);
  process.exit(1);
}

console.log("Login created successfully:");
console.log(`  Email: ${data.email}`);
console.log(`  ID: ${data.id}`);
