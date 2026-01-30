import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function OPTIONS(req) {
    return new Response(null, {
    status: 200,
    headers: corsHeaders,
    });
    }

export async function GET (req, { params }) {
    const { id } = await params;

try {
    const client = await getClientPromise()
    const db = client.db("wad-01");
    const result = await db.collection("item").findOne({_id: new ObjectId(id)});
    console.log("==> result", result);
    return NextResponse.json(result, {
    headers: corsHeaders
    });
 }
 catch (exception) {
     console.log("exception", exception.toString());
     const errorMsg = exception.toString();
     return NextResponse.json({
     message: errorMsg
    }, {
     status: 400,
     headers: corsHeaders
    })
 }
}
export async function PATCH (req, { params }) {
    const { id } = await params;

    try {
        const data = await req.json(); // Moved inside try block to handle invalid JSON
        const partialUpdate = {};
        console.log("data : ", data);
        if (data.itemName != null) partialUpdate.itemName = data.itemName;
        if (data.itemCategory != null) partialUpdate.itemCategory = data.itemCategory;
        if (data.itemPrice != null) partialUpdate.itemPrice = data.itemPrice;
        if (data.status != null) partialUpdate.status = data.status;

        const client = await getClientPromise();
        const db = client.db("wad-01");
        
        const updatedResult = await db.collection("item").updateOne(
            {_id: new ObjectId(id)}, 
            {$set: partialUpdate}
        );

        return NextResponse.json(updatedResult, {
            status: 200,
            headers: corsHeaders
        })
    }
    catch (exception) {
        const errorMsg = exception.toString();
        return NextResponse.json({
            message: errorMsg
        }, {
            status: 400,
            headers: corsHeaders
        })
    }
}
export async function PUT (req, { params }) {
    const { id } = await params;
    
    try {
        const data = await req.json();
        const { itemName, itemCategory, itemPrice, status } = data;

        const client = await getClientPromise();
        const db = client.db("wad-01");

        const updatedResult = await db.collection("item").updateOne(
            {_id: new ObjectId(id)}, 
            {$set: { itemName, itemCategory, itemPrice, status }}
        );
        
        return NextResponse.json(updatedResult, {
            status: 200,
            headers: corsHeaders
        })
    }
    catch (exception) {
        console.log("exception", exception.toString());
        const errorMsg = exception.toString();
        return NextResponse.json({
            message: errorMsg
        }, {
            status: 400,
            headers: corsHeaders
        })
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;
    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");
        const result = await db.collection("item").deleteOne({ _id: new ObjectId(id) });
        
        return NextResponse.json(result, {
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
