// frontend/src/pages/LoginPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";
import { jwtDecode } from "jwt-decode"; // Use named import

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Attempting login with:", { email, password });
    const res = await login(email, password);
    console.log("Login response:", res);
    if (!res || !res.token) {
      console.log("Login failed or no token received");
      return;
    }
    const token = res.token;
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);
    console.log("Decoded token:", decoded);
    if (decoded.role === "admin") {
      console.log("Navigating to admin dashboard");
      navigate("/admin/dashboard");
    } else {
      console.log("Navigating to user home");
      navigate("/user/home");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-8">
        {/* Gradient Heading */}
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          Welcome Back!
        </h2>

        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <Input
            icon={Mail}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {/* Password Input */}
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Forgot Password */}
          <div className="flex items-center mb-6">
            <Link
              to="/forgot-password"
              className="text-sm text-purple-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 font-semibold mb-2">{error}</p>
          )}

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      </div>

      {/* Bottom Signup Link */}
      <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
        <p className="text-sm text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;
