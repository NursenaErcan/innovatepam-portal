import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "innovatepam_session";
const SESSION_TTL_HOURS = 12;

type AppRole = "submitter" | "admin";

function roleToDashboard(role: UserRole): string {
  return role === "admin" ? "/admin/ideas" : "/submitter/ideas";
}

function getSessionExpiryDate(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + SESSION_TTL_HOURS);
  return expiry;
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = `${crypto.randomUUID()}-${crypto.randomBytes(16).toString("hex")}`;
  const expiresAt = getSessionExpiryDate();

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export function getSessionTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function removeSessionByToken(token: string | null): Promise<void> {
  if (!token) {
    return;
  }

  await prisma.session.deleteMany({ where: { token } });
}

export async function requireAuthFromRequest(request: NextRequest) {
  const token = getSessionTokenFromRequest(request);

  if (!token) {
    return null;
  }

  const session = await prisma.session.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  return { session, user: session.user };
}

export async function requireRoleFromRequest(request: NextRequest, role: AppRole) {
  const auth = await requireAuthFromRequest(request);

  if (!auth || auth.user.role !== role) {
    return null;
  }

  return auth;
}

export async function getCurrentUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findFirst({
    where: {
      token,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  return session?.user ?? null;
}

export async function requireRoleForPage(role: AppRole) {
  const user = await getCurrentUserFromCookies();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== role) {
    redirect(roleToDashboard(user.role));
  }

  return user;
}

export function canAccessIdeaAttachment(user: { id: string; role: UserRole }, submitterId: string): boolean {
  return user.role === "admin" || user.id === submitterId;
}

export async function requireDraftOwnerFromRequest(request: NextRequest, ideaId: string): Promise<
  | {
      ok: true;
      auth: NonNullable<Awaited<ReturnType<typeof requireRoleFromRequest>>>;
      idea: NonNullable<Awaited<ReturnType<typeof prisma.idea.findUnique>>>;
    }
  | { ok: false; reason: "unauthorized" | "not-found" | "forbidden" }
> {
  const auth = await requireRoleFromRequest(request, "submitter");
  if (!auth) {
    return { ok: false, reason: "unauthorized" };
  }

  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
  });

  if (!idea || idea.submitterId !== auth.user.id) {
    if (!idea) {
      return { ok: false, reason: "not-found" };
    }

    return { ok: false, reason: "forbidden" };
  }

  return { ok: true, auth, idea };
}
