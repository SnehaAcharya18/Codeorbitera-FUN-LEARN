import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";

function ContactForm() {
  const form = useRef();
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_m6zy0zd",
        "template_61nqngv",
        form.current,
        "HeU5K8q_oAPFerCIP"
      )
      .then(
        () => setSubmitted(true),
        (error) => {
          console.log("FAILED...", error.text);
          alert("Error sending message.");
        }
      );
  };

  const handleNavigateToCodeAnalyzer = () => {
    navigate("/Codeanalyser");
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white flex flex-col">
      {/* 🔹 Navbar */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-black bg-opacity-40 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold font-orbitron">
            C
          </div>
          <span className="text-lg sm:text-xl font-bold font-orbitron">
            Code Orbitera
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = "/dashboard"}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/Community")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Community Forum
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/contact")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Contact Us
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleNavigateToCodeAnalyzer}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Code Analyzer
          </motion.button>
        </div>
      </nav>

      {/* 🔹 Contact Form Section */}
      <div className="flex-1 flex justify-center items-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg p-8 bg-gradient-to-br from-purple-800 via-indigo-900 to-purple-950 text-white rounded-2xl shadow-2xl border border-purple-600"
        >
          {/* Title */}
          <h1 className="text-center text-5xl font-bold mb-2 text-white font-orbitron tracking-widest drop-shadow-lg">
            Contact Us
          </h1>
          <h2 className="text-center text-lg text-purple-200 mb-6 font-semibold font-pressStart">
            We'd love to hear from you
          </h2>

          {/* Form */}
          <form ref={form} onSubmit={sendEmail} className="flex flex-col space-y-4">
            <label className="font-semibold text-lg text-purple-200">
              Your Name
              <input
                type="text"
                name="user_name"
                required
                className="w-full mt-1 px-3 py-2 border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-black/40 text-white placeholder-gray-400"
                placeholder="Enter your name"
              />
            </label>

            <label className="font-semibold text-lg text-purple-200">
              Your Email
              <input
                type="email"
                name="user_email"
                required
                className="w-full mt-1 px-3 py-2 border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-black/40 text-white placeholder-gray-400"
                placeholder="Enter your email"
              />
            </label>

            <label className="font-semibold text-lg text-purple-200">
              Your Message
              <textarea
                name="message"
                rows="4"
                required
                className="w-full mt-1 px-3 py-2 border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-black/40 text-white placeholder-gray-400"
                placeholder="Write your message..."
              />
            </label>

            {/* Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-700 to-purple-900 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/50 transition"
            >
              🚀 Send Message
            </motion.button>

            {submitted && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 mt-4 text-center font-semibold"
              >
                ✅ Message sent successfully! We’ll get back to you soon.
              </motion.p>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default ContactForm;
