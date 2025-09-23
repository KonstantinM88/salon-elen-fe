import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { title: "asc" } });
  return NextResponse.json(services);
}
