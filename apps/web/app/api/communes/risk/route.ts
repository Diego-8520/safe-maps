import { NextResponse } from "next/server";
import { getCommuneRiskRepository } from "@/lib/repositories/repository-factory";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const data = await getCommuneRiskRepository().getAll();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load commune risk data";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
