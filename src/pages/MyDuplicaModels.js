import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function MyDuplicaModels() {
  const navigate = useNavigate();
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [folders, setFolders] = useState([]);
  const [selectedModelIds, setSelectedModelIds] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState({});
console.log("selectedModelIds", selectedModelIds)
console.log("selectedFolderId", selectedFolderId)
  // Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Please login to continue");
      navigate('/login');
      return false;
    }
    return true;
  };

  // Fetch both folders and models
  const fetchData = async () => {
    if (!checkAuth()) return;
    
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      setError("");
      
      // Fetch folders
      const foldersRes = await axios.get("https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/training/folders", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("Folders response:", foldersRes.data);
      
      // Handle the nested folders structure
      if (Array.isArray(foldersRes.data)) {
        // Each document in the array contains a folders array
        const allFolders = foldersRes.data.map(doc => ({
          _id: doc._id,  // Use the document's _id
          folderName: doc.folders[0].folderName,
          models: doc.folders[0].models || []
        }));
        console.log("Processed folders:", allFolders);
        setFolders(allFolders);
      } else {
        setFolders([]);
      }

      // Fetch models
      const modelsRes = await axios.get("https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/training/models", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("Models response:", modelsRes.data);
      setModels(modelsRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || "Failed to load data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!checkAuth()) return;
    
    if (!newFolderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        "https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/training/folders", 
        { folderName: newFolderName.trim() }, 
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("Create folder response:", response.data);
      setNewFolderName("");
      setShowFolderModal(false);
      await fetchData();
    } catch (err) {
      console.error("Failed to create folder:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || "Failed to create folder");
      }
    }
  };

  const handleMoveToFolder = async () => {
    if (!checkAuth()) return;
    
    if (!selectedFolderId || selectedModelIds.length === 0) {
      setError("Please select both a folder and models to move");
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const selectedModels = models.filter(m => selectedModelIds.includes(m._id));
      if (selectedModels.length === 0) {
        setError("No models selected");
        return;
      }

      console.log("Selected models:", selectedModels);
      console.log("Selected folder ID:", selectedFolderId);

      // Move each selected model to the folder
      for (const model of selectedModels) {
        console.log("Moving model:", model);
        const response = await axios.post(
          `https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/training/folders/${selectedFolderId}/models`,
          {
            trainingId: model._id, // Use the model's _id instead of trainingId
            modelName: model.modelName,
            images: model.images || []
          },
          { 
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log("Move to folder response:", response.data);
      }

      setSelectedModelIds([]);
      setSelectedFolderId("");
      await fetchData();
    } catch (err) {
      console.error("Error moving models:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || "Failed to move models to folder");
      }
    }
  };

  const handleImageError = (modelId) => {
    setImageErrors(prev => ({
      ...prev,
      [modelId]: true
    }));
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="flex-1 flex flex-col p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-white text-3xl font-bold">My Duplica Models</h1>
        <div>
          <button
            className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold"
            onClick={() => setShowFolderModal(true)}
            type="button"
          >
            + New Folder
          </button>
        </div>
      </div>

      {/* Folders Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-8">
        {folders.length === 0 ? (
          <div className="text-gray-400 col-span-full">No folders found.</div>
        ) : (
          folders.map((folder) => (
            <Link to={`/folders/${folder.folderName}`} key={folder._id}>
              <div className="bg-black/80 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-yellow-400 transition">
                <div className="flex items-center justify-between p-4 bg-black/70">
                  <span className="text-white font-semibold">{folder.folderName}</span>
                  <span className="text-gray-400 text-sm">
                    {folder.models?.length || 0} models
                  </span>
                </div>
                {folder.models && folder.models.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 p-4">
                    {folder.models.slice(0, 4).map((model, index) => (
                      <div key={index} className="relative w-full h-24 bg-gray-800 rounded overflow-hidden">
                        {model.images && model.images[0] && !imageErrors[model._id] ? (
                          <img
                            src={`http://localhost:3001/uploads/${model.images[0]}`}
                            alt={model.modelName || `Model ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(model._id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                            <span>No Image</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Models Section */}
      <div className="mt-8">
        <h2 className="text-yellow-400 font-semibold mb-2">Your Models</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {models.map((model) => (
            <div key={model._id} className="relative bg-black/80 rounded-xl overflow-hidden shadow-lg border border-gray-700">
              <input
                type="checkbox"
                checked={selectedModelIds.includes(model._id)}
                onChange={() => {
                  setSelectedModelIds((prev) =>
                    prev.includes(model._id)
                      ? prev.filter((id) => id !== model._id)
                      : [...prev, model._id]
                  );
                }}
                className="absolute top-3 right-3 w-5 h-5 accent-yellow-400 rounded focus:ring-2 focus:ring-yellow-400"
              />
              {model.images && model.images[0] && !imageErrors[model._id] ? (
                <img 
                  src={`http://localhost:3001/uploads/${model.images[0]}`} 
                  alt={model.modelName} 
                  className="w-full h-64 object-cover"
                  onError={() => handleImageError(model._id)}
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gray-800 text-gray-500">
                  <span>No Image</span>
                </div>
              )}
              <div className="flex items-center justify-between p-4 bg-black/70">
                <span className="text-white font-semibold">{model.modelName}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  model.status === 'training' ? 'bg-yellow-900 text-yellow-400' :
                  model.status === 'completed' ? 'bg-green-900 text-green-400' :
                  'bg-red-900 text-red-400'
                }`}>
                  {model.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Move to Folder Controls */}
      {selectedModelIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 p-4 rounded-lg shadow-lg border border-yellow-900">
          <div className="flex items-center gap-4">
            <select
              className="p-2 rounded bg-gray-900 text-white border border-gray-700"
              value={selectedFolderId}
              onChange={e => {
                console.log("Selected folder ID:", e.target.value);
                setSelectedFolderId(e.target.value);
              }}
            >
              <option value="">Select folder</option>
              {folders.map(folder => {
                console.log("Folder in dropdown:", folder);
                return (
                  <option key={folder._id} value={folder._id}>
                    {folder.folderName}
                  </option>
                );
              })}
            </select>
            <button
              className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold"
              disabled={!selectedFolderId}
              onClick={() => {
                console.log("Move to folder clicked with folder ID:", selectedFolderId);
                handleMoveToFolder();
              }}
            >
              Move to Folder
            </button>
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded"
              onClick={() => {
                setSelectedModelIds([]);
                setSelectedFolderId("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-yellow-400 font-bold mb-4">Create New Folder</h2>
            <input
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 mb-4"
              placeholder="Folder name"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => {
                  setShowFolderModal(false);
                  setNewFolderName("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold"
                onClick={handleCreateFolder}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
