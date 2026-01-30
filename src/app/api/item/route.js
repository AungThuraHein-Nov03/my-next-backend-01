import corsHeaders from "@/lib/cors";
import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";

export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const client = await getClientPromise();
    const db = client.db("wad-01");
    
    // Get total count for pagination info
    const totalItems = await db.collection("item").countDocuments({});
    const totalPages = Math.ceil(totalItems / limit);

    const result = await db.collection("item")
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    
    console.log(`==> result (page ${page}, limit ${limit})`, result.length);

    return NextResponse.json({
      items: result,
      totalItems,
      totalPages,
      currentPage: page
    }, {
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
  const { itemName, itemPrice, itemCategory, status } = data;

  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");

    const result = await db.collection("item").insertOne({
      itemName,
      itemCategory,
      itemPrice,
      status: status || "ACTIVE" // Default to ACTIVE if not provided
    });

    return NextResponse.json({
      id: result.insertedId,
      itemName,
      itemCategory,
      itemPrice,
      status: status || "ACTIVE"
    }, {
      status: 201,
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
