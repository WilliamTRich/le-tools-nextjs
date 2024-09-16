"use client";

import React, { useState, useCallback } from "react";
import { useDropzone, FileRejection, DropzoneOptions } from "react-dropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon, UploadIcon } from "lucide-react";

export default function Component() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedData, setProcessedData] = useState<any>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        alert("Please select a valid PDF file.");
        return;
      }

      const uploadedFile = acceptedFiles[0];
      if (uploadedFile && uploadedFile.type === "application/pdf") {
        setFile(uploadedFile);
        await processPDF(uploadedFile);
      } else {
        setFile(null);
        alert("Please select a valid PDF file.");
      }
    },
    []
  );

  const processPDF = async (file: File) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process PDF");
      }

      const data = await response.json();
      setProcessedData(data);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Error processing PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  } as DropzoneOptions);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-100">
      <Card className="w-full max-w-md bg-gray-800 border-blue-500">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-blue-400">
            PDF Uploader and OCR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <Label
                {...getRootProps()}
                htmlFor="pdf-upload"
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-blue-500 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDragActive ? "bg-gray-700" : "hover:bg-gray-700"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadIcon className="w-10 h-10 mb-3 text-blue-400" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-400">PDF (MAX. 10MB)</p>
                </div>
                <Input
                  {...getInputProps()}
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                />
              </Label>
            </div>
            {file && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileIcon className="w-6 h-6 text-blue-400" />
                  <span className="font-medium text-blue-400">{file.name}</span>
                </div>
                <p className="text-sm text-gray-400">
                  Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {isProcessing && (
                  <p className="mt-2 text-yellow-400">Processing PDF...</p>
                )}
                {processedData && (
                  <div className="mt-4 bg-gray-600 rounded p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">
                      Processed Data:
                    </h3>
                    <pre className="text-xs text-gray-300 overflow-auto max-h-64">
                      {JSON.stringify(processedData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
