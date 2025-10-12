'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const error = params.get('error'); // покажем ошибку, если вернёт next-auth

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/', // после логина на главную (можно сменить)
    });
  }

  return (
    <main className="min-h-[60vh] grid place-items-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 rounded-2xl border p-4">
        <h1 className="text-xl font-semibold">Вход</h1>

        {error && (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-2 text-rose-300 text-sm">
            Ошибка авторизации
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm opacity-70">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border bg-transparent px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm opacity-70">Пароль</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded-lg border bg-transparent px-3 py-2"
          />
        </div>

        <button type="submit" className="w-full rounded-xl px-3 py-2 border hover:bg-white/5 transition">
          Войти
        </button>
      </form>
    </main>
  );
}



// // src/app/(auth)/login/page.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";
// import Link from "next/link";

// export default function LoginPage() {
//   const router = useRouter();
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     const res = await signIn("credentials", {
//       email,
//       password,
//       redirect: false,
//     });

//     setLoading(false);

//     if (res?.error) {
//       setError("Неверная почта или пароль");
//       return;
//     }
//     router.push("/");
//     router.refresh();
//   }

//   return (
//     <main className="mx-auto max-w-md px-4 py-12">
//       <h1 className="mb-6 text-2xl font-semibold">Вход</h1>

//       <form onSubmit={onSubmit} className="space-y-4">
//         <div>
//           <label className="mb-1 block text-sm">Email</label>
//           <input
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full rounded-md border px-3 py-2 outline-none"
//             required
//           />
//         </div>

//         <div>
//           <label className="mb-1 block text-sm">Пароль</label>
//           <input
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full rounded-md border px-3 py-2 outline-none"
//             minLength={8}
//             required
//           />
//         </div>

//         {error && <p className="text-sm text-red-600">{error}</p>}

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-60"
//         >
//           {loading ? "Входим…" : "Войти"}
//         </button>
//       </form>

//       <p className="mt-4 text-sm">
//         Нет аккаунта?{" "}
//         <Link href="/register" className="underline">
//           Зарегистрироваться
//         </Link>
//       </p>
//     </main>
//   );
// }
