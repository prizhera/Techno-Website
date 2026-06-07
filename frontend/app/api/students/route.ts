import { NextResponse } from "next/server";

import { getStudentsData } from "@/lib/server/major-features";

export function GET() {
  return NextResponse.json({ data: getStudentsData() });
}