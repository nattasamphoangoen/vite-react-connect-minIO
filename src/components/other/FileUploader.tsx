// src/components/FileUploader.tsx
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

interface FileUploadProps {
  onUploadComplete?: () => void;
}

interface UploadingFile {
  file: File;
  progress: number;
}

const s3Client = new S3Client({
  endpoint: "https://172.17.8.179:7000",
  credentials: {
    accessKeyId: "y6eJ5VMOcWYpl39KWKkk",
    secretAccessKey: "1pd7BNtL1kmqi2z27V0QVZCb15lLaUddpgkzGiKo"
  },
  region: "us-east-1",
  forcePathStyle: true,
//   signatureVersion: 'v4',
});

const BUCKET_NAME = 'test'; // แก้ไขเป็นชื่อ bucket ของคุณ

const FileUploader: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    // เริ่มต้นการอัพโหลดด้วยความคืบหน้า 0%
    const newFiles = acceptedFiles.map(file => ({
      file,
      progress: 0
    }));
    
    setUploadingFiles(prev => [...prev, ...newFiles]);
    setError(null);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      try {
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: file.name,
          Body: file,
          ContentType: file.type
        });

        // อัพโหลดไฟล์
        await s3Client.send(command);

        // อัพเดทความคืบหน้าเป็น 100%
        setUploadingFiles(prev => 
          prev.map(f => 
            f.file === file ? { ...f, progress: 100 } : f
          )
        );

      } catch (err) {
        console.error('Error uploading file:', err);
        setError(`เกิดข้อผิดพลาดในการอัพโหลด ${file.name}`);
        
        // ลบไฟล์ที่ error ออกจาก uploadingFiles
        setUploadingFiles(prev => 
          prev.filter(f => f.file !== file)
        );
      }
    }

    // เมื่ออัพโหลดเสร็จทั้งหมด
    if (onUploadComplete) {
      onUploadComplete();
    }

    // รอสักครู่แล้วเคลียร์รายการไฟล์ที่อัพโหลดเสร็จแล้ว
    setTimeout(() => {
      setUploadingFiles(prev => 
        prev.filter(f => f.progress !== 100)
      );
    }, 3000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: true // อนุญาตให้เลือกหลายไฟล์
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-500'
          }
        `}
      >
        <input {...getInputProps()} />
        <p>
          {isDragActive
            ? '✨ วางไฟล์ตรงนี้...'
            : '📁 ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์'}
        </p>
      </div>

      {/* แสดงความคืบหน้าการอัพโหลด */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="bg-gray-100 rounded p-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm">{uploadingFile.file.name}</span>
                <span className="text-sm">{uploadingFile.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadingFile.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* แสดงข้อความ error ถ้ามี */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;