import { verifyJWT } from "@/lib/auth";
import corsHeaders, { getCorsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}
// Helper to parse multipart form data (works in Node.js API routes)
async function parseMultipartFormData(req) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data")) {
    throw new Error("Invalid content-type");
  }
  // Use undici's FormData parser (Node 18+)
  const formData = await req.formData();
  return formData;
}
export async function POST(req) {
  const user = verifyJWT(req);
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: getCorsHeaders(req) },
    );
  }
  let formData;
  try {
    formData = await parseMultipartFormData(req);
  } catch (err) {
    return NextResponse.json(
      { message: "Invalid form data" },
      { status: 400, headers: getCorsHeaders(req) },
    );
  }
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json(
      { message: "No file uploaded" },
      { status: 400, headers: getCorsHeaders(req) },
    );
  }
  // Check if file is an image
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { message: "Only image files allowed" },
      { status: 400, headers: getCorsHeaders(req) },
    );
  }
  // Generate unique filename
  const ext = file.name.split(".").pop();
  const filename = uuidv4() + "." + ext;
  
  const uploadDir = path.join(process.cwd(), "public", "profile-images");
  await fs.mkdir(uploadDir, { recursive: true });
  
  const savePath = path.join(uploadDir, filename);

  // Save file to disk
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(savePath, Buffer.from(arrayBuffer));
  // Update user in MongoDB
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    await db
      .collection("user")
      .updateOne(
        { email: user.email },
        { $set: { profileImage: `/profile-images/${filename}` } },
      );
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to update user" },
      { status: 500, headers: getCorsHeaders(req) },
    );
  }
  return NextResponse.json(
    { imageUrl: `/profile-images/${filename}` },
    { status: 200, headers: getCorsHeaders(req) },
  );
}
export async function DELETE(req) {
  const user = verifyJWT(req);
  if (!user) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401, headers: getCorsHeaders(req) },
    );
  }
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const email = user.email;
    const profile = await db.collection("user").findOne({ email });
    if (profile && profile.profileImage) {
      const filePath = path.join(process.cwd(), "public", profile.profileImage);
      try {
        await fs.rm(filePath);
      } catch (err) {
        // File might not exist, ignore
      }
      await db
        .collection("user")
        .updateOne({ email }, { $set: { profileImage: null } });
    }
    return NextResponse.json(
      { message: "OK" },
      { status: 200, headers: getCorsHeaders(req) },
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.toString() },
      { status: 500, headers: getCorsHeaders(req) },
    );
  }
}
