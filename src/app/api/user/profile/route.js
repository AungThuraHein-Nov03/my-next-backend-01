import { verifyJWT } from "@/lib/auth";
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
export async function GET(req) {
  const user = verifyJWT(req);
  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
        headers: corsHeaders,
      },
    );
  }
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const email = user.email;
    const profile = await db.collection("user").findOne({ email });
    console.log("profile: ", profile);
    return NextResponse.json(profile, {
      headers: corsHeaders,
    });
  } catch (error) {
    console.log("Get Profile Exception: ", error.toString());
    return NextResponse.json(error.toString(), {
      headers: corsHeaders,
    });
  }
}
