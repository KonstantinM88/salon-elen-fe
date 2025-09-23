import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/admin")) return NextResponse.next();

  const auth = req.headers.get("authorization") || "";
  const [type, encoded] = auth.split(" ");
  if (type !== "Basic" || !encoded) {
    return new NextResponse("Auth required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Admin Area"' },
    });
  }
  const [user, pass] = Buffer.from(encoded, "base64").toString().split(":");
  if (user !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASS) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
