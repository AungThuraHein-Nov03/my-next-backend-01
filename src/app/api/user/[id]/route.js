import corsHeaders, { getCorsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export async function OPTIONS(req) {
    return new Response(null, {
        status: 200,
        headers: getCorsHeaders(req),
    });
}

export async function GET(req, { params }) {
    const { id } = await params;

    try {
        const client = await getClientPromise()
        const db = client.db("wad-01");
        const result = await db.collection("user").findOne(
            { _id: new ObjectId(id) },
            { projection: { password: 0 } } // Exclude password
        );
        
        if (!result) {
            return NextResponse.json({ message: "User not found" }, { status: 404, headers: getCorsHeaders(req) });
        }

        return NextResponse.json(result, {
            headers: getCorsHeaders(req)
        });
    }
    catch (exception) {
        console.log("exception", exception.toString());
        return NextResponse.json({
            message: exception.toString()
        }, {
            status: 400,
            headers: getCorsHeaders(req)
        })
    }
}

export async function PUT(req, { params }) {
    const { id } = await params;

    try {
        const data = await req.json();
        /*
          Allowed fields to update: 
          username, email, firstname, lastname, status, role (if exists)
          If password is provided, hash it.
        */
        const { username, email, firstname, lastname, status, password } = data;
        
        const updateDoc = {};
        if (username) updateDoc.username = username;
        if (email) updateDoc.email = email;
        if (firstname) updateDoc.firstname = firstname;
        if (lastname) updateDoc.lastname = lastname;
        if (status) updateDoc.status = status;
        
        if (password) {
            updateDoc.password = await bcrypt.hash(password, 10);
        }

        const client = await getClientPromise();
        const db = client.db("wad-01");

        const updatedResult = await db.collection("user").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateDoc }
        );

        return NextResponse.json(updatedResult, {
            status: 200,
            headers: getCorsHeaders(req)
        })
    }
    catch (exception) {
        console.log("exception", exception.toString());
        // Handle duplicate key errors common in updates too
        const errorMsg = exception.toString();
        let displayErrorMsg = errorMsg;
        
        if (exception.code === 11000) {
             if (errorMsg.includes("username")) {
                displayErrorMsg = "Duplicate Username!!";
             } else if (errorMsg.includes("email")) {
                displayErrorMsg = "Duplicate Email!!";
             }
             return NextResponse.json({ message: displayErrorMsg }, { status: 409, headers: getCorsHeaders(req) });
        }

        return NextResponse.json({
            message: displayErrorMsg
        }, {
            status: 400,
            headers: getCorsHeaders(req)
        })
    }
}

export async function DELETE(req, { params }) {
    const { id } = await params;

    try {
        const client = await getClientPromise();
        const db = client.db("wad-01");

        const result = await db.collection("user").deleteOne({ _id: new ObjectId(id) });

        return NextResponse.json(result, {
            status: 200,
            headers: getCorsHeaders(req)
        })
    }
    catch (exception) {
        console.log("exception", exception.toString());
        return NextResponse.json({
            message: exception.toString()
        }, {
            status: 400,
            headers: getCorsHeaders(req)
        })
    }
}
