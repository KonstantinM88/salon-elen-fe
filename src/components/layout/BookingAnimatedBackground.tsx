// src/components/layout/BookingAnimatedBackground.tsx
import React from "react";

export function BookingAnimatedBackground() {
  return (
    // z-0: фон поверх bg-black родителя, но под контентом (z-10)
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* базовый тёмный градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950 to-black" />

      {/* центральное “солнце” за заголовком */}
      <div className="booking-spotlight" />

      {/* вращающиеся лучи */}
      <div className="booking-rays" />

      {/* световые облака по бокам */}
      <div className="booking-blob-left" />
      <div className="booking-blob-right" />
    </div>
  );
}



// // src/components/layout/BookingAnimatedBackground.tsx
// import React from "react";

// export function BookingAnimatedBackground() {
//   return (
//     // z-0: фон поверх bg-black родителя, но ниже контента (который z-10)
//     <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
//       {/* базовый вертикальный градиент, чтобы не было «дыр» */}
//       <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black" />

//       {/* вращающиеся лучи света */}
//       <div className="booking-rays" />

//       {/* левое и правое «облака» света */}
//       <div className="booking-blob-left" />
//       <div className="booking-blob-right" />
//     </div>
//   );
// }


// // // src/components/layout/BookingAnimatedBackground.tsx
// // import React from "react";

// // export function BookingAnimatedBackground() {
// //   return (
// //     // z-0: фон поверх bg-black родителя, но ниже контента (который z-10)
// //     <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
// //       {/* Верхний мягкий градиент вниз */}
// //       <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/25 via-slate-900 to-black" />

// //       {/* Левое «свечение» */}
// //       <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-fuchsia-500/35 blur-3xl" />

// //       {/* Правое нижнее «свечение» */}
// //       <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-emerald-400/35 blur-3xl" />

// //       {/* Лёгкое затемнение краёв, чтобы текст читался */}
// //       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_transparent_0%,_rgba(0,0,0,0.75)_70%)]" />
// //     </div>
// //   );
// // }



// // src/components/layout/BookingAnimatedBackground.tsx
// import React from "react";

// export function BookingAnimatedBackground() {
//   return (
//     // ВАЖНО: z-0 (НЕ минус!), чтобы фон был поверх bg-black родителя
//     <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
//       {/* Центральное свечение сверху (как у Prisma) */}
//       <div className="absolute inset-x-[-10%] top-[-20%] h-[60%] rounded-[999px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.8),transparent_60%)] blur-3xl" />

//       {/* Розово-фиолетовое пятно слева */}
//       <div className="absolute -left-1/3 top-1/3 h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,_rgba(244,114,182,0.8),transparent_60%)] blur-3xl animate-[booking-orbit_40s_linear_infinite]" />

//       {/* Бирюзовое пятно справа снизу */}
//       <div className="absolute -right-1/3 bottom-[-10%] h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,_rgba(45,212,191,0.7),transparent_60%)] blur-3xl animate-[booking-orbit-reverse_55s_linear_infinite]" />

//       {/* Лёгкое затемнение, чтобы текст хорошо читался */}
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0)_0,_rgba(15,23,42,0.9)_70%)]" />
//     </div>
//   );
// }




// // src/components/layout/BookingAnimatedBackground.tsx
// import React from "react";

// export function BookingAnimatedBackground() {
//   return (
//     <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
//       {/* Размытые цветные пятна как у Prisma */}
//       <div
//         className="
//           absolute -inset-[40%]
//           opacity-60
//           blur-3xl
//           [background:
//             radial-gradient(circle_at_top,_#22d3ee_0,_transparent_55%),
//             radial-gradient(circle_at_center,_#4f46e5_0,_transparent_55%),
//             radial-gradient(circle_at_bottom,_#ec4899_0,_transparent_55%)
//           ]
//         "
//       />

//       {/* Медленно вращающийся слой */}
//       <div
//         className="
//           absolute -inset-[50%]
//           opacity-40
//           mix-blend-screen
//           animate-[spin_35s_linear_infinite]
//           [background:
//             conic-gradient(from_0deg,_#22d3ee,_#a855f7,_#22c55e,_#22d3ee)
//           ]
//         "
//       />

//       {/* Лёгкое затемнение к краям, чтобы текст хорошо читался */}
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0)_0,_rgba(15,23,42,1)_70%)]" />
//     </div>
//   );
// }
