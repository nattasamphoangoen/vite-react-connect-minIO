// src/components/DocumentList.tsx
import React, { useState, useEffect } from "react";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import DocumentViewer from "./DocumentViewer";

const BUCKET_NAME = "test"; // แก้ไขเป็นชื่อ bucket ของคุณ

const s3Client = new S3Client({
  endpoint: "https://172.17.8.179:7000",
  credentials: {
    accessKeyId: "y6eJ5VMOcWYpl39KWKkk",
    secretAccessKey: "1pd7BNtL1kmqi2z27V0QVZCb15lLaUddpgkzGiKo",
  },
  region: "us-east-1",
  forcePathStyle: true,
});

interface Document {
  Key?: string;
  LastModified?: Date;
  Size?: number;
}

const DocumentList: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const command = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
        });

        const response = await s3Client.send(command);
        setDocuments(response.Contents || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
        alert("ไม่สามารถดึงรายการเอกสารได้");
      }
      setLoading(false);
    };

    fetchDocuments();
  }, []);

  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined) return "0 B";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (loading) {
    return <div>กำลังโหลดรายการเอกสาร...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">รายการเอกสาร</h2>
      <div className="grid gap-4">
        {documents.map((doc) => (
          <div
            key={doc.Key}
            className="p-4 border rounded-lg flex items-center justify-between bg-white shadow-sm"
          >
            <DocumentViewer fileName={doc.Key || ""} bucketName={BUCKET_NAME} />
            <div>
              <h3 className="font-medium">{doc.Key}</h3>
              <p className="text-sm text-gray-500">
                ขนาด: {formatFileSize(doc.Size)} | แก้ไขล่าสุด:{" "}
                {doc.LastModified?.toLocaleString("th-TH")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
