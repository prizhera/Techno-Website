import { NextResponse } from "next/server";

import { getQuestionAnalysisData } from "@/lib/server/major-features";

export function GET() {
  return NextResponse.json({ data: getQuestionAnalysisData() });
}