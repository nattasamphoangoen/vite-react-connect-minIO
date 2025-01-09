// import { useEffect, useState } from 'react'
import './App.css'
// import FileUploader from './components/FileUploader';
import MinioFileManager from './components/MinioFileManager';

function App() {
  // const handleUploadComplete = () => {
  //   console.log('อัพโหลดเสร็จสิ้น!');
  //   // เพิ่มโค้ดที่ต้องการให้ทำงานหลังอัพโหลดเสร็จ
  // };

  return (
    <div className="p-4 ">
     {/* <h1 className="text-2xl font-bold mb-6">อัพโหลดไฟล์ MinIO</h1>
     <FileUploader onUploadComplete={handleUploadComplete} /> */}
     {/* <hr className="my-4 w-full" /> */}
    <h1 className="text-2xl font-bold mb-4">จัดการไฟล์ MinIO</h1>
    <MinioFileManager />
  </div>
  );
}

export default App
