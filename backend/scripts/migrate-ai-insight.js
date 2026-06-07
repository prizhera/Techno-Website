import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env") });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function migrate() {
  console.log("Creating exec_sql function...");

  const sql = `
CREATE OR REPLACE FUNCTION public.exec_sql(query_text TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query_text;
END;
$$;
`;

  const { error: fnError } = await supabase.rpc("exec_sql", {
    query_text: sql,
  });

  if (fnError) {
    console.log("Could not create exec_sql function:", fnError.message);
    console.log("Trying direct migration instead...");

    const { error: migError } = await supabase.rpc("exec_sql", {
      query_text:
        "ALTER TABLE questions ADD COLUMN IF NOT EXISTS ai_insight TEXT",
    });

    if (migError) {
      console.log("Migration via RPC failed:", migError.message);
      console.log(
        "\nPlease run this SQL in your Supabase Dashboard SQL Editor:\n"
      );
      console.log(
        "ALTER TABLE questions ADD COLUMN IF NOT EXISTS ai_insight TEXT;"
      );
      process.exit(1);
    }
  } else {
    console.log("exec_sql function created. Running migration...");

    const { error: migError } = await supabase.rpc("exec_sql", {
      query_text:
        "ALTER TABLE questions ADD COLUMN IF NOT EXISTS ai_insight TEXT",
    });

    if (migError) {
      console.log("Migration failed:", migError.message);
      process.exit(1);
    }
  }

  const { data, error: verError } = await supabase
    .from("questions")
    .select("ai_insight")
    .limit(1);

  if (verError) {
    console.log("Verification failed:", verError.message);
    process.exit(1);
  }

  console.log("Success! ai_insight column exists on questions table.");
}

migrate();
