//src/app/api/admin/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // ✅ SOFT DELETE - только помечаем как удалённый
    const deleted = await prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: session.user.id || "admin",
      },
    });

    console.log(`🗑️ Client soft deleted: ${deleted.id} | ${deleted.name} | by ${session.user.email}`);

    return NextResponse.json({ 
      success: true,
      message: "Client moved to archive",
      client: deleted,
    });

  } catch (error) {
    console.error("Error soft deleting client:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
