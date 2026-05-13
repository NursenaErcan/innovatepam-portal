import { NextRequest, NextResponse } from "next/server";
import {
  clearSessionCookie,
  getSessionTokenFromRequest,
  removeSessionByToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = getSessionTokenFromRequest(request);
  await removeSessionByToken(token);

  const response = NextResponse.json({ success: true }, { status: 200 });
  clearSessionCookie(response);
  return response;
}
