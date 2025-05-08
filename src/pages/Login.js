import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("https://9c56-2405-201-202e-b0f1-d91e-dfe3-c401-d4c1.ngrok-free.app/auth/login", { email, password });
      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        navigate("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-black/80 p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <span className="text-4xl mr-2">🟡</span>
            <span className="text-yellow-400 text-4xl font-bold">duplica</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Welcome Back!</h2>
          <p className="text-gray-300 mb-6">Sign in with one click and let AI handle the rest.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm">EMAIL</label>
              <input
                type="email"
                className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 mt-1"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 mt-1 pr-10"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400"
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-gray-400 text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <a href="#" className="hover:underline">I forgot my password?</a>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <button type="submit" className="w-full py-3 rounded bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold text-lg mt-2">Sign in</button>
          </form>
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="mx-4 text-gray-400 text-sm">or create your account with</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>
          <div className="flex gap-4 mb-6">
            <button className="flex-1 flex items-center justify-center py-3 rounded bg-white text-black font-semibold"><span className="mr-2">🌐</span>Continue with Google</button>
            <button className="flex-1 flex items-center justify-center py-3 rounded bg-white text-black font-semibold"><span className="mr-2"></span>Continue with Apple</button>
          </div>
          <p className="text-gray-400 text-xs text-center mb-2">By continuing, you agree to Duplica. <a href="#" className="text-yellow-400 underline">Terms of use</a> and <a href="#" className="text-yellow-400 underline">privacy policy</a>.</p>
          <p className="text-gray-400 text-center">Don't have an account ? <a href="/signup" className="text-orange-400 underline">Sign Up</a></p>
        </div>
      </div>
      {/* Right: Image */}
      <div className="hidden md:block md:w-1/2 h-screen">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" alt="login visual" className="w-full h-full object-cover" />
      </div>
    </div>
  );
} 
