import { NextResponse } from "next/server";
import { getCommuneRiskRepository } from "@/lib/repositories/repository-factory";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getCommuneRiskRepository().getAll();
  return NextResponse.json(data);
}
