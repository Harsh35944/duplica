import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const TrainDuplicaModels = lazy(() => import("./TrainDuplicaModels"));
const MyDuplicaModels = lazy(() => import("./pages/MyDuplicaModels"));
const GenerateImages = lazy(() => import("./pages/GenerateImages"));
const Favorites = lazy(() => import("./pages/Favorites"));
const UpgradePlan = lazy(() => import("./pages/UpgradePlan"));
const Login = lazy(() => import("./pages/Login"));
const SignUp = lazy(() => import("./pages/SignUp"));
const FolderDetail = lazy(() => import("./pages/FolderDetail"));
const FolderImages = lazy(() => import("./pages/FolderImages"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
  </div>
);

const Sidebar = React.memo(() => {
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
});

const Header = React.memo(() => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-gray-700">
      <span className="text-yellow-400 text-3xl font-bold">duplica</span>
      <div className="space-x-3">
        <button
          className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-500 transition-colors"
          onClick={() => navigate("/upgrade-plan")}
        >
          Upgrade Plan
        </button>
        {token ? (
          <button
            className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <button
            className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-600 transition-colors"
            onClick={() => navigate("/login")}
          >
            Sign up/Login
          </button>
        )}
      </div>
    </header>
  );
});

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route
          path="/train-duplica-models"
          element={
            <PrivateRoute>
              <TrainDuplicaModels />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-duplica-models"
          element={
            <PrivateRoute>
              <MyDuplicaModels />
            </PrivateRoute>
          }
        />
        <Route
          path="/generate-images"
          element={
            <PrivateRoute>
              <GenerateImages />
            </PrivateRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <Favorites />
            </PrivateRoute>
          }
        />
        <Route
          path="/upgrade-plan"
          element={
            <PrivateRoute>
              <UpgradePlan />
            </PrivateRoute>
          }
        />
        <Route
          path="/folders/:folderName"
          element={
            <PrivateRoute>
              <FolderDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/folder/:folderId"
          element={
            <PrivateRoute>
              <FolderImages />
            </PrivateRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}

export default function RootApp() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-tr from-black via-purple-900 to-yellow-900 flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <App />
        </div>
      </div>
    </Router>
  );
}
