import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FolderDetail = () => {
  const { folderName } = useParams();
  console.log(folderName)
  const navigate = useNavigate();
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (modelId) => {
    setImageErrors(prev => ({
      ...prev,
      [modelId]: true
    }));
  };

  useEffect(() => {
    const fetchFolderDetails = async () => {
      try {
        console.log('Fetching folder details for name:', folderName);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get(`https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/folders/name/${folderName}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Folder details response:', response.data);
        if (!response.data) {
          throw new Error('No folder data received');
        }
        setFolder(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching folder details:', err);
        setError(err.response?.data?.message || 'Failed to fetch folder details');
        setLoading(false);
      }
    };

    if (folderName) {
      fetchFolderDetails();
    } else {
      setError('No folder name provided');
      setLoading(false);
    }
  }, [folderName]);

  const handleRemoveModel = async (modelId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Note: You'll need to implement this endpoint in your backend
      await axios.delete(
        `https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/training/folders/${folderName}/models/${modelId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Refresh folder data
      const response = await axios.get(`https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/training/folders/name/${folderName}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFolder(response.data);
    } catch (err) {
      console.error('Error removing model:', err);
      setError(err.response?.data?.message || 'Failed to remove model');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 mb-4">Folder not found</div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">{folder.folderName}</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {folder.models?.map((model) => (
          <div key={model.trainingId} className="relative group bg-black/80 rounded-lg overflow-hidden border border-gray-700">
            <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-lg overflow-hidden">
              {model.images && model.images.length > 0 && !imageErrors[model.trainingId] ? (
                <img
                  src={`http://localhost:3001/uploads/${model.images[0]}`}
                  alt={`Model ${model.modelName}`}
                  className="object-cover w-full h-full"
                  onError={() => handleImageError(model.trainingId)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
                  <span>No Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={() => handleRemoveModel(model.trainingId)}
                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all duration-300"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="p-4 text-sm text-gray-300">
              <div className="font-semibold">Model: {model.modelName}</div>
              <div className="text-gray-400">Training ID: {model.trainingId}</div>
            </div>
          </div>
        ))}
      </div>

      {(!folder.models || folder.models.length === 0) && (
        <div className="text-center text-gray-500 mt-8">
          No models in this folder
        </div>
      )}
    </div>
  );
};

export default FolderDetail;
