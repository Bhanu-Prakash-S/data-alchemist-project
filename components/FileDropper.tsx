"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { parseExcel } from "@/lib/parseFile";
import { useAppStore } from "@/store/useAppStore";

export default function FileDropper() {
  const { setData, loadFromLocalStorage } = useAppStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      const parsed = await parseExcel(file);
      Object.entries(parsed).forEach(([entity, data]) => {
        setData(entity as any, data);
      });
      loadFromLocalStorage();
    },
    [setData, loadFromLocalStorage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  return (
    <Card
      {...getRootProps()}
      className="flex flex-col items-center justify-center h-full border-2 border-dashed cursor-pointer p-8"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here...</p>
      ) : (
        <p>Drag & drop an Excel file here, or click to select files</p>
      )}
    </Card>
  );
}
