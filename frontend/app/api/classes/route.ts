import { NextResponse } from "next/server";

import { getClassesData } from "@/lib/server/major-features";

export function GET() {
  return NextResponse.json({ data: getClassesData() });
}