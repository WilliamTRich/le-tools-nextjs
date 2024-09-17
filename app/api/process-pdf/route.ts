import { NextRequest, NextResponse } from "next/server";
import { analyzeDocument } from "@/lib/azure-document-intelligence";
import { v4 as uuidv4 } from "uuid";

// This would be replaced with a proper database in a production app
const jobStore = new Map();

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
  }

  const jobId = uuidv4();
  jobStore.set(jobId, { status: "processing" });

  // Start processing in the background
  processFileAsync(jobId, file).catch(console.error);

  return NextResponse.json(
    { jobId, message: "Processing started" },
    { status: 202 }
  );
}

async function processFileAsync(jobId: string, file: File) {
  try {
    console.log(`Starting processing for job ${jobId}`);
    const fileBuffer = await file.arrayBuffer();
    const result = await analyzeDocument(fileBuffer);

    const processedData = {
      tables: result.tables,
    };

    const jsonString = JSON.stringify(processedData, null, 2);
    const filename = `${file.name.split(".")[0]}_processed.json`;

    jobStore.set(jobId, {
      status: "completed",
      data: jsonString,
      filename,
    });

    console.log(`Completed processing for job ${jobId}`);
  } catch (error) {
    console.error(`Error processing document for job ${jobId}:`, error);
    jobStore.set(jobId, { status: "failed", error: (error as Error).message });
  }
}

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { message: "No job ID provided" },
      { status: 400 }
    );
  }

  const job = jobStore.get(jobId);

  if (!job) {
    return NextResponse.json({ message: "Job not found" }, { status: 404 });
  }

  if (job.status === "processing") {
    return NextResponse.json({ status: "processing" }, { status: 202 });
  }

  if (job.status === "failed") {
    return NextResponse.json(
      { status: "failed", error: job.error },
      { status: 500 }
    );
  }

  // Job is completed
  const blob = new Blob([job.data], { type: "application/json" });
  return new NextResponse(blob, {
    status: 200,
    headers: {
      "Content-Disposition": `attachment; filename="${job.filename}"`,
      "Content-Type": "application/json",
    },
  });
}
