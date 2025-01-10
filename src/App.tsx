// import { useEffect, useState } from 'react'
import './App.css'
// import FileUploader from './components/FileUploader';
import MinioFileManager from './components/MinioFileManager';

function App() {
  return (
    <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">จัดการไฟล์ MinIO</h1>
    <MinioFileManager />
  </div>
  );
}

export default App
