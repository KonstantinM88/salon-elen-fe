// src/app/admin/services/[id]/gallery/page.tsx
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ArrowLeft, Images } from "lucide-react";
import GalleryManager from "./GalleryManager";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServiceGalleryPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "MASTER")) {
    redirect("/");
  }

  const { id } = await params;

  const service = await prisma.service.findUnique({
    where: { id },
    include: {
      gallery: {
        orderBy: { sortOrder: "asc" },
      },
      parent: {
        select: { name: true },
      },
    },
  });

  if (!service) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/services"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              {service.parent && (
                <>
                  <span>{service.parent.name}</span>
                  <span>→</span>
                </>
              )}
              <span>{service.name}</span>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Images className="w-6 h-6 text-fuchsia-400" />
              Галерея работ
            </h1>
          </div>
        </div>

        {/* Gallery Manager */}
        <GalleryManager 
          serviceId={service.id} 
          serviceName={service.name}
          initialGallery={service.gallery}
          cover={service.cover}
        />

        {/* Back button at bottom */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Вернуться к услугам
          </Link>
        </div>
      </div>
    </div>
  );
}



// // src/app/admin/services/[id]/gallery/page.tsx
// import { redirect, notFound } from "next/navigation";
// import Link from "next/link";
// import { prisma } from "@/lib/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { ArrowLeft, Images } from "lucide-react";
// import GalleryManager from "./GalleryManager";

// export const dynamic = "force-dynamic";

// type PageProps = {
//   params: Promise<{ id: string }>;
// };

// export default async function ServiceGalleryPage({ params }: PageProps) {
//   const session = await getServerSession(authOptions);
  
//   if (!session || (session.user?.role !== "ADMIN" && session.user?.role !== "MASTER")) {
//     redirect("/");
//   }

//   const { id } = await params;

//   const service = await prisma.service.findUnique({
//     where: { id },
//     include: {
//       gallery: {
//         orderBy: { sortOrder: "asc" },
//       },
//       parent: {
//         select: { name: true },
//       },
//     },
//   });

//   if (!service) {
//     notFound();
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-white p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center gap-4 mb-8">
//           <Link
//             href="/admin/services"
//             className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </Link>
//           <div>
//             <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
//               {service.parent && (
//                 <>
//                   <span>{service.parent.name}</span>
//                   <span>→</span>
//                 </>
//               )}
//               <span>{service.name}</span>
//             </div>
//             <h1 className="text-2xl font-bold flex items-center gap-3">
//               <Images className="w-6 h-6 text-fuchsia-400" />
//               Галерея работ
//             </h1>
//           </div>
//         </div>

//         {/* Gallery Manager */}
//         <GalleryManager 
//           serviceId={service.id} 
//           serviceName={service.name}
//           initialGallery={service.gallery}
//           cover={service.cover}
//         />
//       </div>
//     </div>
//   );
// }