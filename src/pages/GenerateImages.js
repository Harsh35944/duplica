import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const aspectRatios = [
  { label: "1080 x 1080", desc: "Square" },
  { label: "1080 x 1920", desc: "Portrait" },
  { label: "1920 x 1080", desc: "Landscape" },
  { label: "3840 x 2160", desc: "4K Ultra HD" },
];

export default function GenerateImages() {
  const [selected, setSelected] = useState(0);
  const [batchSize, setBatchSize] = useState(5);
  const [prompt, setPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'public', 'gallery'
  const [actionLoading, setActionLoading] = useState(false);
  const [tempImages, setTempImages] = useState([]);
  const [folders, setFolders] = useState([]);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const navigate = useNavigate();

  // Fetch generated images
  const fetchGeneratedImages = async () => {
    try {
      const token = localStorage.getItem('token');
     
      console.log('Fetching images with token:', token ? 'Token exists' : 'No token');
      let endpoint 
      
      if (viewMode === 'public') {
        endpoint = 'http://localhost:3001/generate/public/' ;
      } else if (viewMode === 'gallery') {
        endpoint = 'http://localhost:3001/generate/gallery/' ;
      }
      console.log('Fetching from endpoint:', endpoint);

      const response = await axios.get(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetched images response:', response.data);
      setGeneratedImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error.response || error);
      setGeneratedImages([]);
    }
  };

  useEffect(() => {
    fetchGeneratedImages();
  }, [viewMode]);

  // Fetch folders
  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/generate/folders', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }); 
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // Handle image generation
  const handleGenerate = async () => {
    if (!prompt) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      console.log('Generating images with token:', token ? 'Token exists' : 'No token');
      const response = await axios.post(
        'http://localhost:3001/generate/create',
        {
         
          prompt,
          aspectRatio: aspectRatios[selected].label,
          batchSize
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setTempImages(response.data);
      console.log('Generation response:', response.data);
      
      // After generation, fetch all images to show the new ones
      await fetchGeneratedImages();
      setPrompt("");
    } catch (error) {
      console.error('Error generating image:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (imageId, imageIndex) => {
    setSelectedImages(prev => {
      const key = `${imageId}-${imageIndex}`;
      if (prev.includes(key)) {
        return prev.filter(k => k !== key);
      }
      return [...prev, key];
    });
  };

  // Handle making images public
  const handleMakePublic = async () => {
    if (selectedImages.length === 0) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // First save the selected images with public flag as true
      const selectedImageData = selectedImages.map(key => {
        const [imageId, imageIndex] = key.split('-');
        const image = tempImages[parseInt(imageIndex)];
        return {
          url: image.url,
          isPublic: true // Set public flag to true
        };
      });

      // Get the prompt from the current generation
      const currentPrompt = prompt || "Generated Image"; // Fallback if prompt is empty

      await axios.post(
        'http://localhost:3001/generate/save',
        {
          prompt: currentPrompt,
          selectedImages: selectedImageData
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh images after saving
      await fetchGeneratedImages();
      setSelectedImages([]);
      setTempImages([]); // Clear temp images after saving
      setPrompt(""); // Clear the prompt after saving
    } catch (error) {
      console.error('Error saving public images:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle adding to gallery
  const handleAddToGallery = async () => {
    if (selectedImages.length === 0) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Save the selected images with public flag as false
      const selectedImageData = selectedImages.map(key => {
        const [imageId, imageIndex] = key.split('-');
        const image = tempImages[parseInt(imageIndex)];
        return {
          url: image.url,
          isPublic: false // Set public flag to false for gallery
        };
      });

      // Get the prompt from the current generation
      const currentPrompt = prompt || "Generated Image"; // Fallback if prompt is empty

      await axios.post(
        'http://localhost:3001/generate/save',
        {
          prompt: currentPrompt,
          selectedImages: selectedImageData
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Refresh images after saving
      await fetchGeneratedImages();
      setSelectedImages([]);
      setTempImages([]); // Clear temp images after saving
      setPrompt(""); // Clear the prompt after saving
    } catch (error) {
      console.error('Error saving gallery images:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (imageId, imageIndex) => {
    try {
      const token = localStorage.getItem('token');
      const image = tempImages[parseInt(imageIndex)];
      
      // Update local state immediately for better UX
      setTempImages(prevImages => 
        prevImages.map((img, idx) => {
          if (idx === parseInt(imageIndex)) {
            return { ...img, isFavourite: !img.isFavourite };
          }
          return img;
        })
      );

      // If the image is already saved, update its favorite status
      if (imageId !== `temp-${imageIndex}`) {
        await axios.post(
          'http://localhost:3001/generate/toggle-favorite',
          {
            generateId: imageId,
            imageIndex: parseInt(imageIndex)
          },
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Refresh images to ensure sync with server
        await fetchGeneratedImages();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3001/generate/create-folder',
        {
          folderName: newFolderName.trim()
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setNewFolderName("");
      setShowFolderModal(false);
      fetchFolders(); // Refresh folders list
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  // Add folder button to the controls section
  const renderFolderControls = () => (
    <div className="bg-black/80 rounded-lg p-6 border border-yellow-900">
      <h2 className="text-yellow-400 font-semibold mb-2 flex items-center">Folders</h2>
      <div className="space-y-2">
        <button
          onClick={() => setShowFolderModal(true)}
          className="w-full bg-gray-800 text-yellow-400 px-4 py-2 rounded hover:bg-yellow-400 hover:text-black transition"
        >
          Create New Folder
        </button>
        {folders.map(folder => (
          <div key={folder._id} className="flex items-center justify-between bg-gray-800 p-2 rounded">
            <button
              onClick={() => navigate(`/folder/${folder._id}`)}
              className="text-gray-300 hover:text-yellow-400 flex-1 text-left"
            >
              {folder.folderName}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Add folder creation modal
  const renderFolderModal = () => (
    showFolderModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-900 p-6 rounded-lg w-96">
          <h3 className="text-yellow-400 text-xl mb-4">Create New Folder</h3>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter folder name"
            className="w-full p-2 bg-gray-800 text-white rounded mb-4"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowFolderModal(false)}
              className="px-4 py-2 bg-gray-700 text-white rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFolder}
              className="px-4 py-2 bg-yellow-400 text-black rounded"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row p-8 gap-8">
      {/* Left Controls */}
      <div className="w-full md:w-1/3 space-y-6">
        {/* Prompt */}
        <div className="bg-black/80 rounded-lg p-6 border border-yellow-900 mb-4">
          <h2 className="text-yellow-400 font-semibold mb-2 flex items-center">Prompt</h2>
          <p className="text-gray-300 text-sm mb-3">Please describe your creative ideas for the image, or view suggestions for a quick start.</p>
          <textarea 
            className="w-full p-3 rounded bg-gray-900 text-white border border-yellow-700 mb-2" 
            rows={3} 
            placeholder="Describe your image or Upload"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button className="text-yellow-400">📋</button>
            <button className="text-yellow-400" onClick={() => setPrompt("")}>🗑️</button>
            <button className="text-yellow-400">📄</button>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="bg-black/80 rounded-lg p-6 border border-yellow-900">
          <h2 className="text-yellow-400 font-semibold mb-2 flex items-center">Aspect Ratio</h2>
          <p className="text-gray-300 text-sm mb-3">Select the aspect ratio for your image.</p>
          <div className="grid grid-cols-2 gap-2">
            {aspectRatios.map((ratio, index) => (
              <button
                key={ratio.label}
                className={`p-2 rounded text-sm ${
                  selected === index
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
                onClick={() => setSelected(index)}
              >
                <div className="font-medium">{ratio.label}</div>
                <div className="text-xs opacity-75">{ratio.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Batch Size */}
        <div className="bg-black/80 rounded-lg p-6 border border-yellow-900">
          <h2 className="text-yellow-400 font-semibold mb-2 flex items-center">Batch Size</h2>
          <p className="text-gray-300 text-sm mb-3">Select the number of images to generate.</p>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="10"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-yellow-400 font-medium w-8 text-center">{batchSize}</span>
          </div>
        </div>

        {/* Generate Button */}
        <button 
          className="w-full bg-gray-800 text-yellow-400 font-bold py-3 rounded-lg mt-2 hover:bg-yellow-400 hover:text-black transition"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>

        {/* Add Folder Controls */}
        {renderFolderControls()}
      </div>

      {/* Right Preview */}
      <div className="flex-1 flex flex-col bg-black/60 rounded-lg min-h-[500px] relative">
        {/* View Mode Tabs */}
        <div className="flex border-b border-yellow-900">
          <button
            className={`px-4 py-2 ${viewMode === 'all' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
            onClick={() => setViewMode('all')}
          >
            All Images
          </button>
          <button
            className={`px-4 py-2 ${viewMode === 'public' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
            onClick={() => setViewMode('public')}
          >
            Public Images
          </button>
          <button
            className={`px-4 py-2 ${viewMode === 'gallery' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}
            onClick={() => setViewMode('gallery')}
          >
            Gallery
          </button>
        </div>

        {tempImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {tempImages.map((img, index) => (
              <div key={`temp-${index}`} className="relative group">
                <input
                  type="checkbox"
                  checked={selectedImages.includes(`temp-${index}`)}
                  onChange={() => handleImageSelect(`temp-${index}`, index)}
                  className="absolute top-2 right-2 z-10"
                />
                <img
                  src={img.url}
                  alt="Generated image"
                  className="w-full h-48 object-cover rounded"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white text-sm">
                  {prompt}
                </div>
                <button
                  onClick={() => handleFavoriteToggle(`temp-${index}`, index)}
                  className="absolute top-2 left-2 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <svg 
                    className={`w-5 h-5 ${img.isFavourite ? 'text-red-500 fill-current' : 'text-white'}`}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : generatedImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
            {generatedImages.map((item) => (
              item.image.map((img, index) => (
                <div key={`${item._id}-${index}`} className="relative group">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(`${item._id}-${index}`)}
                    onChange={() => handleImageSelect(item._id, index)}
                    className="absolute top-2 right-2 z-10"
                  />
                  <img
                    src={img.url}
                    alt={item.prompt || 'Generated image'}
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      console.error('Image load error:', img);
                      e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-white text-sm">
                    {item.prompt || 'Generated image'}
                  </div>
                  <button
                    onClick={() => handleFavoriteToggle(item._id, index)}
                    className="absolute top-2 left-2 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                  >
                    <svg 
                      className={`w-5 h-5 ${img.isFavourite ? 'text-red-500 fill-current' : 'text-white'}`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                  {viewMode === 'gallery' && (
                    <div className="absolute top-2 right-10 bg-yellow-400 text-black px-2 py-1 rounded text-xs">
                      Gallery
                    </div>
                  )}
                  {viewMode === 'public' && (
                    <div className="absolute top-2 right-10 bg-green-400 text-black px-2 py-1 rounded text-xs">
                      Public
                    </div>
                  )}
                </div>
              ))
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="flex flex-col items-center">
              <div className="bg-gray-800 rounded-full p-8 mb-4">
                <svg width="64" height="64" fill="none" stroke="currentColor" className="text-yellow-400" viewBox="0 0 24 24">
                  <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2"/>
                  <path d="M8 7V5a4 4 0 0 1 8 0v2" strokeWidth="2"/>
                </svg>
              </div>
              <p className="text-gray-300 text-center">
                {viewMode === 'public' ? 'No public images yet' :
                 viewMode === 'gallery' ? 'No gallery images yet' :
                 'Release your creative potential.\nExperience the magic of Duplica'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedImages.length > 0 && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black/90 p-4 rounded-lg shadow-lg border border-yellow-900">
            <div className="flex items-center gap-4">
              <button
                className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold disabled:opacity-50"
                onClick={handleMakePublic}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Make Public'}
              </button>
              <button
                className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold disabled:opacity-50"
                onClick={handleAddToGallery}
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Add to Gallery'}
              </button>
              <button
                className="bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => setSelectedImages([])}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {renderFolderModal()}
    </div>
  );
} 