import corsHeaders from "@/app/lib/cors"; 
import { NextResponse } from "next/server"; 

export async function OPTIONS(req) { 
    return new Response(null, { 
        status: 200, 
        headers: corsHeaders, 
    }); 
} 
export async function GET() { 
    const message = { 
        message: "Hello World!"
    }; 
    return NextResponse.json(message, { 
        headers: corsHeaders, 
    }); 
} 