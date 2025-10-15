import { NextResponse } from 'next/server';

export async function GET() {
  const v = process.env.DATABASE_URL ?? '';
  try {
    const u = new URL(v);
    if (u.password) u.password = '***';
    if (u.username) u.username = '***';
    return NextResponse.json({ databaseUrl: u.toString() });
  } catch {
    return NextResponse.json({ databaseUrl: '(invalid or empty)' });
  }
}
