import corsHeaders, { getCorsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { ensureIndexes } from "@/lib/ensureIndexes";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(req),
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
    const totalItems = await db.collection("user").countDocuments({});
    const totalPages = Math.ceil(totalItems / limit);

    // Fetch users but exclude password field
    const result = await db.collection("user")
      .find({})
      .project({ password: 0 }) // Exclude password from result
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      users: result,
      totalItems,
      totalPages,
      currentPage: page
    }, {
      headers: getCorsHeaders(req)
    });
  } catch (exception) {
    console.log("exception", exception.toString());
    return NextResponse.json({
      message: exception.toString()
    }, {
      status: 400,
      headers: getCorsHeaders(req)
    });
  }
}

export async function POST(req) {
  const data = await req.json();
  const username = data.username;
  const email = data.email;
  const password = data.password;
  const firstname = data.firstname;
  const lastname = data.lastname;
  if (!username || !email || !password) {
    return NextResponse.json(
      {
        message: "Missing mandatory data",
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
    const result = await db.collection("user").insertOne({
      username: username,
      email: email,
      password: await bcrypt.hash(password, 10),
      firstname: firstname,
      lastname: lastname,
      status: "ACTIVE",
    });
    console.log("result", result);
    return NextResponse.json(
      {
        id: result.insertedId,
      },
      {
        status: 200,
        headers: getCorsHeaders(req),
      },
    );
  } catch (exception) {
    console.log("exception", exception.toString());
    const errorMsg = exception.toString();
    console.log("Detailed error:", errorMsg);
    let displayErrorMsg = errorMsg;
    
    if (errorMsg.includes("user_1 dup key")) {
        // Auto-fix the bad index
        await ensureIndexes();
        
        try {
            // Retry the insertion automatically
            const client = await getClientPromise();
            const db = client.db("wad-01");
            const result = await db.collection("user").insertOne({
              username: username,
              email: email,
              password: await bcrypt.hash(password, 10),
              firstname: firstname,
              lastname: lastname,
              status: "ACTIVE",
            });
            return NextResponse.json(
              { id: result.insertedId },
              { status: 200, headers: getCorsHeaders(req) }
            );
        } catch (retryEx) {
            // If retry fails, check if it's a real duplicate now
            const retryErrorMsg = retryEx.toString();
            if (retryErrorMsg.includes("duplicate")) {
               if (retryErrorMsg.includes("username")) displayErrorMsg = "Duplicate Username!!";
               else if (retryErrorMsg.includes("email")) displayErrorMsg = "Duplicate Email!!";
               else displayErrorMsg = retryErrorMsg;
            } else {
               displayErrorMsg = retryErrorMsg;
            }
             return NextResponse.json(
              { message: displayErrorMsg },
              { status: 400, headers: getCorsHeaders(req) }
            );
        }
    }

    if (errorMsg.includes("duplicate")) {
      if (errorMsg.includes("username")) {
        displayErrorMsg = "Duplicate Username!!";
      } else if (errorMsg.includes("email")) {
        displayErrorMsg = "Duplicate Email!!";
      }
    }
    return NextResponse.json(
      {
        message: displayErrorMsg,
      },
      {
        status: 400,
        headers: getCorsHeaders(req),
      },
    );
  }
}
