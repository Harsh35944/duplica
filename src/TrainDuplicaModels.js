import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function TrainDuplicaModels() {
  const navigate = useNavigate();
  const [modelName, setModelName] = useState("");
  const [triggerWord, setTriggerWord] = useState("");
  const [inputImages, setInputImages] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Convert files to URLs (for preview)
    const fileUrls = files.map(file => URL.createObjectURL(file));
    setInputImages(fileUrls.join(','));
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleTrain = async (e) => {
    e.preventDefault();
    setStatus("");
    setResult(null);
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
    

      const formData = new FormData();
      formData.append('modelName', modelName);
      formData.append('triggerWord', triggerWord);
      
      // Append each file to formData
      selectedFiles.forEach((file) => {
        formData.append('inputImages', file);
      });

      const res = await axios.post("http://localhost:3001/training/trainings", formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type, let the browser set it with the boundary
        },
      });
      setStatus(res.data.status || "Started");
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || "Training failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row p-8 gap-8">
    
      <form onSubmit={handleTrain} className="w-full md:w-1/3 space-y-6">
       
        <div className="bg-black/80 rounded-lg p-6 border border-yellow-900 mb-4">
          <h2 className="text-yellow-400 font-semibold mb-2 flex items-center">🟡 Upload Images</h2>
          <p className="text-gray-300 text-sm mb-3">Higher Face Reference means more reference to the face of the subject.</p>
          <div 
            className="bg-gray-900 border-2 border-dashed border-yellow-700 rounded-lg flex flex-col items-center justify-center py-8 mb-4 cursor-pointer hover:border-yellow-500 transition-colors"
            onClick={handleUploadClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept=".png,.jpeg,.jpg,.webp"
              className="hidden"
            />
            <span className="text-yellow-400 text-lg mb-2">⬆️ Upload Images</span>
            <p className="text-gray-400 text-sm">
              {selectedFiles.length > 0 
                ? `${selectedFiles.length} file(s) selected` 
                : "Click to select files"}
            </p>
            <span className="text-gray-400 text-sm mt-2">
              or <span className="underline cursor-pointer text-yellow-400">Bulk Upscale</span>
            </span>
          </div>
          <ul className="text-gray-300 text-xs space-y-1 mb-2">
            <li>Recommend using <span className="text-yellow-400 font-bold">35-50 images</span> for the best results</li>
            <li><span className="text-yellow-400 font-bold">Upload 20-100 images</span> interface allows selecting a folder or compressed file (<span className="text-yellow-400">.zip, .rar</span>)</li>
            <li>Supported formats: <span className="text-yellow-400">.png, .jpeg, .webp</span></li>
          </ul>
        </div>
        {/* Model Name */}
        <div className="bg-black/80 rounded-lg p-4 border border-yellow-900 mb-4">
          <label className="text-yellow-400 font-semibold block mb-1 flex items-center">📝 Model Name</label>
          <input
            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700"
            placeholder="Enter model name..."
            value={modelName}
            onChange={e => setModelName(e.target.value)}
          />
        </div>
        {/* Trigger Word */}
        <div className="bg-black/80 rounded-lg p-4 border border-yellow-900 mb-4">
          <label className="text-yellow-400 font-semibold block mb-1 flex items-center">💡 Trigger Word</label>
          <input
            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700"
            placeholder="Enter a unique trigger word..."
            value={triggerWord}
            onChange={e => setTriggerWord(e.target.value)}
          />
        </div>
        {/* Button */}
        <button
          type="submit"
          className="w-full bg-gray-800 text-yellow-400 font-bold py-3 rounded-lg mt-2 hover:bg-yellow-400 hover:text-black transition"
          disabled={loading}
        >
          {loading ? "Training..." : "Create Duplica Model"}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {status && <div className="text-green-400 mt-2">Status: {status}</div>}
      </form>
      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-black/60 rounded-lg min-h-[500px] relative">
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="flex flex-col items-center">
            <div className="bg-gray-800 rounded-full p-8 mb-4">
              <svg width="64" height="64" fill="none" stroke="currentColor" className="text-yellow-400" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2"/>
                <path d="M8 7V5a4 4 0 0 1 8 0v2" strokeWidth="2"/>
              </svg>
            </div>
            <p className="text-gray-300 text-center">Release your creative potential.<br/>Experience the magic of Duplica</p>
            {result && (
              <pre className="text-xs text-gray-400 mt-4 bg-gray-900 p-2 rounded max-w-lg overflow-x-auto text-left">{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
