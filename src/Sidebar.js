import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-64 bg-black/80 text-white p-6 space-y-4 border-r border-gray-700 hidden md:block min-h-screen">
      <nav className="space-y-2">
        <Link to="/" className={`flex items-center px-3 py-2 rounded font-semibold ${location.pathname === "/" ? "bg-yellow-900/30" : "hover:bg-gray-800"}`}>
          <span className="mr-2">🏠</span> Home
        </Link>
        <Link to="/train-duplica-models" className={`flex items-center px-3 py-2 rounded font-semibold ${location.pathname === "/train-duplica-models" ? "bg-yellow-900/30" : "hover:bg-gray-800"}`}>
          <span className="mr-2">🛠️</span> Train Duplica Models
        </Link>
        <Link to="/my-duplica-models" className={`flex items-center px-3 py-2 rounded font-semibold ${location.pathname === "/my-duplica-models" ? "bg-yellow-900/30" : "hover:bg-gray-800"}`}>
          <span className="mr-2">📁</span> My Duplica Models
        </Link>
        <Link to="/generate-images" className={`flex items-center px-3 py-2 rounded font-semibold ${location.pathname === "/generate-images" ? "bg-yellow-900/30" : "hover:bg-gray-800"}`}>
          <span className="mr-2">🖼️</span> Generate Images
        </Link>
        <Link to="/favorites" className={`flex items-center px-3 py-2 rounded font-semibold ${location.pathname === "/favorites" ? "bg-yellow-900/30 text-yellow-400 border border-yellow-400" : "hover:bg-gray-800"}`}>
          <span className="mr-2">💛</span> Favorites
        </Link>
      </nav>
    </aside>
  );
} 