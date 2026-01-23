import corsHeaders from "@/app/lib/cors";
import { getClientPromise } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";
export async function GET() {
 const client = await getClientPromise();
 const db = client.db("sample_mflix");
 const result = await
db.collection("comments").find({}).skip(0).limit(10).toArray();
 return NextResponse.json(result, {
 headers: corsHeaders
 });
}