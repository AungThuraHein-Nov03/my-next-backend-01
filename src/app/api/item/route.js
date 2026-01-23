import corsHeaders from "@/app/lib/cors";
import { NextResponse } from "next/server";
import { getClientPromise } from "@/app/lib/mongodb";

export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET() {
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const result = await db.collection("item").find({}).toArray();
    console.log("==> result", result);

    return NextResponse.json(result, {
      headers: corsHeaders
    });
  } catch (exception) {
    console.log("exception", exception.toString());
    const errorMsg = exception.toString();

    return NextResponse.json({
      message: errorMsg
    }, {
      status: 400,
      headers: corsHeaders
    });
  }
}

export async function POST(req) {
  const data = await req.json();
  const itemName = data.name;
  const itemPrice = data.price;
  const itemCategory = data.category;

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("item").insertOne({
      itemName: itemName,
      itemCategory: itemCategory,
      itemPrice: itemPrice,
      status: "ACTIVE"
    });

    return NextResponse.json({
      id: result.insertedId
    }, {
      status: 200,
      headers: corsHeaders
    });
  } catch (exception) {
    console.log("exception", exception.toString());
    const errorMsg = exception.toString();

    return NextResponse.json({
      message: errorMsg
    }, {
      status: 400,
      headers: corsHeaders
    });
  }
}
