import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const data = { email, password, firstName, lastName };
    try {
      const res = await axios.post("http://localhost:3001/auth/register", data);
      if (res.data.access_token) {
        localStorage.setItem("token", res.data.access_token);
        setSuccess("Registration successful!");
        navigate("/"); // Redirect to home page
      } else {
        setError("Registration failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center items-center bg-black/80 p-8">
        <div className="w-full max-w-2xl">
          <div className="flex items-center mb-8">
            <span className="text-4xl mr-2">🟡</span>
            <span className="text-yellow-400 text-4xl font-bold">duplica</span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Create an account</h2>
          <p className="text-gray-300 mb-6">Join us in seconds with AI-powered quick registration.</p>
          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-gray-400 text-sm">FIRST NAME</label>
              <input
                type="text"
                className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 mt-1"
                placeholder="Enter your first name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm">LAST NAME</label>
              <input
                type="text"
                className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 mt-1"
                placeholder="Enter your last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
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
                  {showPassword ? "🙈" : "🙉"}
                </button>
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-sm">DATE OF BIRTH</label>
              <input type="text" className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 mt-1" placeholder="DD/MM/YYYY" />
            </div>
            <div>
              <label className="text-gray-400 text-sm">COUNTRY</label>
              <select className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 mt-1">
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
                <option>Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full py-3 rounded bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold text-lg mb-4"
              >
                Sign up
              </button>
            </div>
          </form>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-500">{success}</div>}
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
          <p className="text-gray-400 text-center">Already have an account ? <a href="/login" className="text-orange-400 underline">Log in</a></p>
        </div>
      </div>
      {/* Right: Image */}
      <div className="hidden md:block md:w-1/2 h-screen">
        <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80" alt="signup visual" className="w-full h-full object-cover" />
      </div>
    </div>
  );
} 