import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const deploymentVersion =
    process.env.DEPLOYMENT_VERSION ?? process.env.NEXT_DEPLOYMENT_ID ?? "";

  return NextResponse.json(
    { deploymentVersion },
    {
      headers: {
        "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
      },
    },
  );
}
