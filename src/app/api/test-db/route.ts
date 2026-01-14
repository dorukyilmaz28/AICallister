import { NextRequest, NextResponse } from "next/server";
import { userDb } from "@/lib/database";

export async function GET(req: NextRequest) {
  try {
    console.log("Testing database connection...");
    
    // Test database bağlantısı
    const users = await userDb.findByEmail("test@test.com");
    console.log("Database connection successful");
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
