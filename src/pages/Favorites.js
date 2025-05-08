import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Favorites() {
  const [favoriteImages, setFavoriteImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFavoriteImages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get("https://2e37-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/generate/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoriteImages(response.data);
    } catch (error) {
      console.error("Error fetching favorite images:", error);
      setError("Failed to load favorite images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavoriteImages();
  }, []);

  const renderImages = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      );
    }

    if (favoriteImages.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-xl">No favorite images yet</div>
        </div>
      );
    }

    return (
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-8 gap-6 space-y-6">
        {favoriteImages.map((item) =>
          item.image
            .filter((img) => img.isFavourite)
            .map((img, index) => (  
              <div
                key={`${item._id}-${index}`}
                className="mb-6 break-inside-avoid rounded-xl overflow-hidden shadow-lg border border-gray-700 bg-black/80"
              >
                <img
                  src={img.url}
                  alt={item.prompt || "Favorite"}
                  className="w-full object-cover rounded-xl"
                />
                <div className="p-4">
                  <p className="text-white text-sm">{item.prompt}</p>
                </div>
              </div>
            ))
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-8">
      <h1 className="text-white text-3xl font-bold mb-8">Favorites</h1>
      {renderImages()}
    </div>
  );
} 
