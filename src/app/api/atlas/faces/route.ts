import { NextRequest, NextResponse } from "next/server";
import { BboxFilterSchema } from "@/modules/geospatial/schemas";
import { searchPublishedFaces } from "@/modules/inventory/repository";

export async function GET(request: NextRequest) {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = BboxFilterSchema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid spatial filter parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const result = await searchPublishedFaces(parsed.data);
  return NextResponse.json({
    faces: result.faces,
    configured: result.configured,
    count: result.faces.length,
    disclaimer:
      "Published inventory reflects Boardscape field review and operator-confirmed listing authority. Availability requires operator reconfirmation per flight.",
  });
}
