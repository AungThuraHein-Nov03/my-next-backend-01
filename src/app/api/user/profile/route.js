import { verifyJWT } from "@/lib/auth";
import corsHeaders, { getCorsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(req),
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
        headers: getCorsHeaders(req),
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
      headers: getCorsHeaders(req),
    });
  } catch (error) {
    console.log("Get Profile Exception: ", error.toString());
    return NextResponse.json(error.toString(), {
      headers: getCorsHeaders(req),
    });
  }
}
export async function PUT(req) {
  const user = verifyJWT(req);
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      {
        status: 401,
        headers: getCorsHeaders(req),
      },
    );
  }

  try {
    const body = await req.json();
    const { firstname, lastname } = body;

    if (!firstname && !lastname) {
      return NextResponse.json(
        { message: "At least one field (firstname or lastname) must be provided" },
        {
          status: 400,
          headers: getCorsHeaders(req),
        },
      );
    }

    const client = await getClientPromise();
    const db = client.db("wad-01");
    const email = user.email;

    const updateData = {};
    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;

    const result = await db
      .collection("user")
      .updateOne({ email }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        {
          status: 404,
          headers: getCorsHeaders(req),
        },
      );
    }

    return NextResponse.json(
      { message: "Profile updated successfully" },
      {
        status: 200,
        headers: getCorsHeaders(req),
      },
    );
  } catch (error) {
    console.log("Update Profile Exception: ", error.toString());
    return NextResponse.json(
      { message: "Failed to update profile" },
      {
        status: 500,
        headers: getCorsHeaders(req),
      },
    );
  }
}
