import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    app: "Eravault Vintage",
    timestamp: new Date().toISOString()
  });
}
