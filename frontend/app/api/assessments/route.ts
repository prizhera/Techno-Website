import { NextResponse } from "next/server";

import { getAssessmentsData } from "@/lib/server/major-features";

export function GET() {
  return NextResponse.json({ data: getAssessmentsData() });
}