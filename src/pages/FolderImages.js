import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FolderImages = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFolderImages = async () => {
      try {
        if (!folderId) {
          throw new Error('No folder ID provided');
        }

        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Calling API to fetch folder images...', folderId);

        const response = await axios.get(`https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/generate/folder/${folderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        console.log('API Response:', response.data);
        if (!response.data) {
          throw new Error('No data received from server');
        }
        setFolder(response.data);
      } catch (err) {
        console.error('API Error:', err);
        if (err.message === 'Network Error') {
          setError('Unable to connect to the server. Please check your internet connection.');
        } else if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Folder not found. Please check the URL and try again.');
        } else {
          setError(err.response?.data?.message || err.message || 'Something went wrong');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFolderImages();
  }, [folderId, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleImageClick = (image) => {
    console.log('Image clicked:', image);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button onClick={handleBack} className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Folder not found
        </div>
        <button onClick={handleBack} className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 mt-8">
      <div className="mb-8">
        <button onClick={handleBack} className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition-colors mb-4">
          Back to Generate Images
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">{folder.folderName}</h1>
        <p className="text-gray-400">{folder.images?.length || 0} images</p>
      </div>

      {folder.images?.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-black/20 rounded-lg p-8">
          <h2 className="text-xl text-gray-400 mb-2">No images in this folder</h2>
          <p className="text-gray-500">Add images to this folder to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {folder.images.map((image) => (
            console.log("image", image),
            <div key={image._id} onClick={() => handleImageClick(image)} className="bg-black/20 rounded-lg overflow-hidden cursor-pointer transform hover:scale-102 transition-transform duration-200">
              <div className="relative aspect-square">
                <img
                  src={image.url}
                  alt="Folder image"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image load error:', image._id);
                    e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                  }}
                />
              </div>
              <div className="p-2 flex justify-between items-center">
                <span className="text-gray-400 text-sm">{new Date(image.time).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderImages;
