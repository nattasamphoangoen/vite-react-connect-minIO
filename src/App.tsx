import './App.css'
import MinioFileManager from './components/MinioFileManager';

function App() {
  return (
    <div className="p-4">
    <h2 style={{ fontWeight: 'bold' }}>จัดการไฟล์ MinIO</h2>
    <MinioFileManager />
  </div>
  );
}

export default App
