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
      tables: result.tables,
    };

    // Convert the processed data to a JSON string
    const jsonString = JSON.stringify(processedData, null, 2);

    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: "application/json" });

    // Generate a filename based on the original file's name
    const filename = `${file.name.split(".")[0]}_processed.json`;

    // Create and return the response with the file
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      { message: "Error processing document" },
      { status: 500 }
    );
  }
}
