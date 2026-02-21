import corsHeaders, { getCorsHeaders } from "@/lib/cors";
import { NextResponse } from "next/server";
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}
export async function POST(req) {
  // Clear the JWT cookie by setting it to empty and expired
  const response = NextResponse.json(
    {
      message: "Logout successful",
    },
    {
      status: 200,
      headers: getCorsHeaders(req),
    },
  );
  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
