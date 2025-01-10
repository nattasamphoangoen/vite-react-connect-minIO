// src/components/DocumentViewer.tsx
import React from 'react';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface DocumentViewerProps {
  fileName: string;
  bucketName: string;
}

const s3Client = new S3Client({
  endpoint: "https://172.17.8.179:7000",
  credentials: {
    accessKeyId: "y6eJ5VMOcWYpl39KWKkk",
    secretAccessKey: "1pd7BNtL1kmqi2z27V0QVZCb15lLaUddpgkzGiKo"
  },
  region: "us-east-1",
  forcePathStyle: true,
});

const DocumentViewer: React.FC<DocumentViewerProps> = ({ fileName, bucketName }) => {
  const handleViewDocument = async () => {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      });

      // สร้าง signed URL ที่มีอายุ 1 ชั่วโมง (3600 วินาที)
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      // เปิดลิงก์ในหน้าต่างใหม่
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Error generating document URL:', error);
      alert('ไม่สามารถเปิดเอกสารได้');
    }
  };

  return (
    <button
      onClick={handleViewDocument}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center space-x-2"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
      <span>ดูเอกสาร</span>
    </button>
  );
};

export default DocumentViewer;