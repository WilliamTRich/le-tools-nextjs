import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/azure-document-intelligence";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
  }

  try {
    const fileBuffer = await file.arrayBuffer();
    const result = await analyzeDocument(fileBuffer);

    const processedData = {
      text: result.content,
      tables: result.tables,
      // Add more fields as needed
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      { message: "Error processing document" },
      { status: 500 }
    );
  }
}
