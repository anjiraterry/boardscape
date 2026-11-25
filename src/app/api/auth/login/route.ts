import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifyPassword,
} from "@/lib/auth/crypto";
import { getSql } from "@/lib/db/neon";
import { isDatabaseConfigured } from "@/lib/env";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Valid email and password are required." },
      { status: 400 }
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: "Neon DATABASE_URL is not configured in .env.local." },
      { status: 503 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const sql = getSql();

  const users = await sql`
    SELECT id, email, password_hash, status
    FROM profiles
    WHERE LOWER(email) = ${email}
    LIMIT 1
  `;

  const user = users[0];
  if (
    !user ||
    !user.password_hash ||
    !verifyPassword(parsed.data.password, String(user.password_hash))
  ) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (String(user.status) !== "active") {
    return NextResponse.json(
      { error: "This account is suspended. Contact a platform administrator." },
      { status: 403 }
    );
  }

  await sql`
    UPDATE profiles
    SET last_login_at = NOW()
    WHERE id = ${String(user.id)}
  `;

  const token = signSessionToken(String(user.id), String(user.email));
  const response = NextResponse.json({
    ok: true,
    userId: String(user.id),
    email: String(user.email),
  });

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
