import {
  AzureKeyCredential,
  DocumentAnalysisClient,
} from "@azure/ai-form-recognizer";

export async function analyzeDocument(fileBuffer: ArrayBuffer) {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT!;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY!;
  const client = new DocumentAnalysisClient(
    endpoint,
    new AzureKeyCredential(key)
  );

  const poller = await client.beginAnalyzeDocument(
    "prebuilt-document",
    new Uint8Array(fileBuffer)
  );
  return await poller.pollUntilDone();
}
