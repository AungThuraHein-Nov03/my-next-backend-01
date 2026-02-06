import corsHeaders from "@/lib/cors";
import { NextResponse } from "next/server";
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
export async function POST() {
  // Clear the JWT cookie by setting it to empty and expired
  const response = NextResponse.json(
    {
      message: "Logout successful",
    },
    {
      status: 200,
      headers: corsHeaders,
    },
  );
  response.cookies.set("token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    ecure: process.env.NODE_ENV === "production",
  });
  return response;
}
