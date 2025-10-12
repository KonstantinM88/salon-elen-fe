// src/app/_components/Header.tsx
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthButtons from "./auth/AuthButtons";
import UserMenu from "./auth/UserMenu";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-screen-2xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-wide">
          Salon · Admin
        </Link>

        {/* Right zone */}
        <div className="flex items-center gap-2">
          {!user ? (
            <AuthButtons />
          ) : (
            <UserMenu name={user.name ?? null} email={user.email ?? null} />
          )}
        </div>
      </div>
    </header>
  );
}
