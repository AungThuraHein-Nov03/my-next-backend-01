import corsHeaders, { getCorsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
const JWT_SECRET = process.env.JWT_SECRET || "mydefaultjwtsecret"; // Use a strong secret in production
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}
export async function POST(req) {
  const data = await req.json();
  const { email, password } = data;
  if (!email || !password) {
    return NextResponse.json(
      {
        message: "Missing email or password",
      },
      {
        status: 400,
        headers: getCorsHeaders(req),
      },
    );
  }
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const user = await db.collection("user").findOne({ email });
    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
          headers: getCorsHeaders(req),
        },
      );
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
          headers: getCorsHeaders(req),
        },
      );
    }
    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    // Set JWT as HTTP-only cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
      },
      {
        status: 200,
        headers: getCorsHeaders(req),
      },
    );
    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (exception) {
    console.log("exception", exception.toString());
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      {
        status: 500,
        headers: getCorsHeaders(req),
      },
    );
  }
}
