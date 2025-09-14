import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const CertificatePage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [score, setScore] = useState(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error("Razorpay SDK failed to load");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        await checkAuth();
      }
      setAuthChecked(true);
    };
    verifyAuth();
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    const stateScore = state?.totalScore;
    const storedScore = localStorage.getItem("score");

    if (stateScore) setScore(stateScore);
    else if (storedScore) setScore(storedScore);
    else navigate("/results");
  }, [navigate, state]);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert("Payment system not ready. Please try again.");
      return;
    }

    if (!user || !user._id || !user.email) {
      alert("User data is incomplete. Please log in again.");
      navigate("/login");
      return;
    }

    const options = {
      key: "rzp_test_e97VtNNyLXWhCy",
      amount: 19900,
      currency: "INR",
      name: "Code Orbitera",
      description: "Certificate Fee",
      handler: async function (response) {
        setPaymentDone(true);
        setLoading(true);

        try {
          const res = await fetch(
            "http://localhost:5000/api/certificates/generate-certificate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: user?.name || "Student",
                email: user.email,
                score,
                paymentId: response.razorpay_payment_id,
                date: new Date().toISOString(),
              }),
            }
          );

          if (!res.ok) throw new Error(`Server Error: ${await res.text()}`);
          const data = await res.json();
          setCertificateUrl(data.url);

          const payRes = await fetch("http://localhost:5000/api/payments/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: user._id,
              email: user.email,
              payment_id: response.razorpay_payment_id,
              score,
              amount: 19900,
              date: new Date().toISOString(),
            }),
          });

          if (!payRes.ok)
            throw new Error(`Payment save failed: ${await payRes.text()}`);
          alert("🎉 Certificate created & payment processed!");
        } catch (err) {
          console.error("❌ Error:", err.message);
          alert(`Error: ${err.message}`);
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: user?.name || "Student",
        email: user.email || "user@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#6B46C1",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleDownload = () => {
    if (certificateUrl) {
      window.open(`http://localhost:5000${certificateUrl}`, "_blank");
    }
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  if (!score || !authChecked) {
    return (
      <div className="flex items-center justify-center h-screen text-[#4B347D] text-xl md:text-2xl">
        Loading...
      </div>
    );
  }

  const hasEnoughPoints = score >= 2000;

  return (
    <div className="relative flex items-center justify-center min-h-screen w-screen font-sans bg-gradient-to-b from-purple-100 to-purple-200">
      {/* 🌊 Wavy Background */}
      <div className="absolute inset-0">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 810"
          preserveAspectRatio="none"
        >
          <path
            fill="#7B5EAA"
            d="M0 0 C480 270 960 0 1440 270 V810 H0 Z"
            opacity="0.6"
          />
          <path
            fill="#6B46C1"
            d="M0 200 C360 400 1080 100 1440 300 V810 H0 Z"
            opacity="0.8"
          />
          <path
            fill="#5A3DA7"
            d="M0 400 C600 600 840 300 1440 500 V810 H0 Z"
          />
        </svg>
      </div>

      {/* 🧾 Certificate Panel */}
      <div className="relative bg-white shadow-2xl rounded-2xl p-4 sm:p-6 md:p-10 w-full max-w-[90%] sm:max-w-[80%] md:max-w-4xl text-center border-4 border-purple-200 flex flex-col justify-center backdrop-blur-md z-10">
        {/* Back to Dashboard Button */}
        <button
          onClick={handleBackToDashboard}
          className="absolute top-4 left-4 z-20 px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-lg shadow-md transition-all duration-300 font-medium min-w-[120px] min-h-[44px] touch-manipulation"
        >
          ⬅️ Back to Dashboard
        </button>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#4B347D] mb-4 font-serif tracking-wide drop-shadow-lg">
          CODEORBITERA
        </h1>
        <p className="text-base sm:text-lg text-[#6B46C1] mb-4 sm:mb-6 font-light">
          Excellence in Coding Education
        </p>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#4B347D] mb-4 sm:mb-6 flex items-center justify-center font-serif drop-shadow-md">
          🎓 Certificate of Completion
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-[#6B46C1] mb-6 sm:mb-8 font-light tracking-wide italic drop-shadow-sm">
          Awarded for outstanding achievement in course completion
        </p>

        <div className="bg-purple-100 border-2 border-purple-300 rounded-xl p-4 sm:p-6 md:p-10 mb-6 sm:mb-8 backdrop-blur-sm">
          <p className="text-xl sm:text-2xl md:text-3xl text-[#4B347D] font-medium drop-shadow-sm">
            Presented to:{" "}
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#5A3DA7]">
              {user?.name || "Student"}
            </span>
          </p>
          <p className="text-lg sm:text-xl md:text-2xl text-[#6B46C1] mt-2 sm:mt-4 drop-shadow-sm">
            Final Score:{" "}
            <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#5A3DA7]">{score}</span>
          </p>
        </div>

        {!paymentDone ? (
          <div className="relative flex justify-center group">
            <button
              onClick={handlePayment}
              disabled={!hasEnoughPoints || !razorpayLoaded}
              className={`mt-4 sm:mt-6 px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-base sm:text-lg md:text-xl ${
                hasEnoughPoints && razorpayLoaded
                  ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 hover:scale-105"
                  : "bg-purple-400 cursor-not-allowed"
              } text-white rounded-xl shadow-lg transition-all duration-300 font-medium tracking-wide drop-shadow-md min-w-[160px] min-h-[48px] touch-manipulation`}
            >
              💳 Get Your Certificate (₹199)
            </button>

            {/* Tooltip (only when user doesn't have enough points) */}
            {!hasEnoughPoints && (
              <div className="absolute top-full mt-2 hidden group-hover:flex bg-black text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg shadow-lg w-max">
                ⚡ You need 2000 points to get a certificate
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <div className="p-4 sm:p-5 bg-purple-100 text-[#4B347D] rounded-xl shadow-md font-medium text-sm sm:text-base">
              ✅ Payment successful! Your certificate is ready.
            </div>
            {loading ? (
              <div className="text-base sm:text-lg text-[#4B347D] animate-pulse">
                Generating your certificate...
              </div>
            ) : (
              <button
                onClick={handleDownload}
                className="mt-2 sm:mt-4 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg bg-white text-[#4B347D] hover:bg-purple-100 hover:scale-105 rounded-xl shadow-lg transition duration-300 font-medium min-w-[160px] min-h-[48px] touch-manipulation"
              >
                📄 Download Certificate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatePage;