// src/components/MinioFileManager.tsx
import React, { useState, useEffect } from 'react';
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { useDropzone } from 'react-dropzone';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Define interfaces
interface MinioConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
}

interface FileItem {
  Key?: string;
  Size?: number;
  LastModified?: Date;
}

// MinIO configuration
const MINIO_CONFIG: MinioConfig = {
  endpoint: "https://172.17.8.179:7000",
  accessKey: "y6eJ5VMOcWYpl39KWKkk",
  secretKey: "1pd7BNtL1kmqi2z27V0QVZCb15lLaUddpgkzGiKo",
  bucket: "test" // แก้ไขเป็นชื่อ bucket ของคุณ
};

const s3Client = new S3Client({
  endpoint: MINIO_CONFIG.endpoint,
  credentials: {
    accessKeyId: MINIO_CONFIG.accessKey,
    secretAccessKey: MINIO_CONFIG.secretKey
  },
  region: "us-east-1",
  forcePathStyle: true,
  // signatureVersion: 'v4',
});

const MinioFileManager: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // ฟังก์ชันดึงรายการไฟล์
  const fetchFiles = async (): Promise<void> => {
    try {
      const command = new ListObjectsV2Command({
        Bucket: MINIO_CONFIG.bucket,
      });
      
      const response = await s3Client.send(command);
      setFiles(response.Contents || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      // alert('ไม่สามารถดึงรายการไฟล์ได้');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // ฟังก์ชันดาวน์โหลดไฟล์
  const downloadFile = async (key: string): Promise<void> => {
    try {
      const command = new GetObjectCommand({
        Bucket: MINIO_CONFIG.bucket,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('No file body received');
      }

      const blob = await response.Body.transformToByteArray();
      const url = window.URL.createObjectURL(new Blob([blob]));
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', key);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('ไม่สามารถดาวน์โหลดไฟล์ได้');
    }
  };

  // ฟังก์ชันลบไฟล์
  const deleteFile = async (key: string): Promise<void> => {
    if (!window.confirm('คุณแน่ใจหรือไม่ที่จะลบไฟล์นี้?')) return;

    try {
      const command = new DeleteObjectCommand({
        Bucket: MINIO_CONFIG.bucket,
        Key: key,
      });
      
      await s3Client.send(command);
      await fetchFiles();
      alert('ลบไฟล์สำเร็จ');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('ไม่สามารถลบไฟล์ได้');
    }
  };

  // ฟังก์ชันอัพโหลดไฟล์
  const onDrop = async (acceptedFiles: File[]): Promise<void> => {
    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        const now = new Date();
        const filePath = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}/${file.name}`;
        const command = new PutObjectCommand({
          Bucket: MINIO_CONFIG.bucket,
          Key: filePath, //file.name,
          Body: file,
          ContentType: file.type
        });

        await s3Client.send(command);
      }
      
      await fetchFiles();
      alert('อัพโหลดไฟล์สำเร็จ!');
    } catch (error) {
      console.error('Error uploading:', error);
      alert('เกิดข้อผิดพลาดในการอัพโหลด');
    }
    
    setUploading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // ฟังก์ชันแปลงขนาดไฟล์
  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

 const handleViewDocument = async (fileName: string) => {
     try {
       const command = new GetObjectCommand({
         Bucket: MINIO_CONFIG.bucket,
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
    <div className="p-4">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 h-[200px]"
        style={{
          transition: 'border-color 0.2s ease-in-out',
          height: '200px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '2px dashed rgb(128, 128, 128)', // เปลี่ยนสีให้ชัดเจนขึ้น
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // เพิ่มเงาให้กรอบ
          cursor: 'pointer',
        }}
      >
        <input {...getInputProps()} />
        <p>{uploading ? 'กำลังอัพโหลด...' : 'ลากไฟล์มาวางที่นี่หรือคลิกเพื่อเลือกไฟล์'}</p>
      </div>
      
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">รายการไฟล์</h3>
        {loading ? (
          <p>กำลังโหลดรายการไฟล์...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border" style={{ borderCollapse: 'separate', borderSpacing: '5rem 0rem' }}>
              <thead>
                <tr className="bg-gray-100" style={{ whiteSpace: 'nowrap' }}>
                  <th className="px-6 py-3 border-b text-left">ชื่อไฟล์</th>
                  <th className="px-6 py-3 border-b text-left">ขนาด</th>
                  <th className="px-6 py-3 border-b text-left">วันที่แก้ไข</th>
                  <th className="px-6 py-3 border-b text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.Key} className="hover:bg-gray-50" style={{ transition: 'background-color 0.2s', gap: '0.5rem' }}>
                    <td className="px-6 py-4 border-b">{file.Key?.split('/').pop()}</td>
                    <td className="px-6 py-4 border-b">{formatFileSize(file.Size)}</td>
                    <td className="px-6 py-4 border-b">
                      {file.LastModified?.toLocaleString('th-TH')}
                    </td>
                    <td className="px-6 py-4 border-b text-center" style={{ whiteSpace: 'nowrap', gap: '0.5rem', marginLeft: '1rem' }}>
                      <button
                        onClick={() => file.Key && downloadFile(file.Key)}
                        className="mx-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        style={{ margin: '0.1rem' }}
                      >
                        ดาวน์โหลด
                      </button>
                      <button
                        onClick={() => file.Key && deleteFile(file.Key)}
                        className="mx-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        style={{ margin: '0.1rem' }}
                      >
                        ลบ
                      </button>
                      <button
                        onClick={() => handleViewDocument(`/${file.Key}`)}
                        className="text-blue-500 hover:underline"
                        style={{ margin: '0.1rem' }}
                      >
                      ดู
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinioFileManager;