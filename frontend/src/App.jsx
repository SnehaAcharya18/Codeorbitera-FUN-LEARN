import { Navigate, Route, Routes } from "react-router-dom";
import FloatingShape from "./components/FloatingShape";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from './pages/AdminDashboard';
import LoadingSpinner from "./components/LoadingSpinner";
import Home from "./pages/Home";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import DebuggerGame from "./pages/hard/DebuggerGame";
import DebuggingGameApp from "./pages/hard/DebuggingGamingApp";
import ChatBot from "./components/ChatBot";
import CodeEditor from "./pages/CodeEditor";
import CertificatePage from "./pages/CertificatePage"
import { Contact } from "lucide-react";
import ContactForm from "./pages/ContactForm";
import RobotChargingGame from "./pages/easy/RobotChargingGame"
import LearningGame from "./pages/easy/LearningGame";
import MessengerGame from "./pages/easy/Messenger";
import LogicGame from "./pages/easy/LogicGame";
import BubbleSortGame from "./pages/medium/BubbleSortGame";
import CommunityForum from "./pages/CommunityForum";
import BridgeGame from "./pages/easy/BrigeGame";
import MazeGame from "./pages/medium/MazeGame";
import FifoGame from "./pages/medium/FifoGame";
import InsertionGame from "./pages/medium/InsertionGame";
import LifoGame from "./pages/medium/LifoGame";
import DebugGame from "./pages/hard/DebugGame";
import DashboardUser from "./pages/DashboardUser";
import Leaderboard from "./pages/Leaderboard";
import PasswordCrack from "./pages/hard/PasswordCrack";
import Elevater from "./pages/hard/ElevaterFix";
import ElevaterGame from "./pages/hard/DebuggingGamingApp";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (!user.isVerified) {
		return <Navigate to="/verify-email" replace />;
	}

	return children;
};

// redirect authenticated users away from login and signup
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		return <Navigate to="/dashboard" replace />;
	}

	return children;
};

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		
		<div
			className="min-h-screen bg-gradient-to-br
    from-gray-900 via-purple-1000 to-purple-700 flex items-center justify-center relative overflow-hidden"
		>
			<FloatingShape color="bg-purple-500" size="w-64 h-64" top="-5%" left="10%" delay={0} />
			<FloatingShape color="bg-purple-300" size="w-48 h-48" top="70%" left="80%" delay={5} />
			<FloatingShape color="bg-purple-100" size="w-32 h-32" top="40%" left="-10%" delay={2} />

			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<Home />} />
				<Route
					path="/login"
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path="/signup"
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route path="/verify-email" element={<EmailVerificationPage />} />
				<Route
					path="/forgot-password"
					element={<ForgotPasswordPage />}
				/>
				<Route
					path="/reset-password/:token"
					element={<ResetPasswordPage />}
				/>

				{/* Protected Routes */}
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
						
					}
				/>
				<Route
					path="/certificate"
					element={
						<ProtectedRoute>
							<CertificatePage />
						</ProtectedRoute>
						
					}
				/>
				<Route
					path="/RobotChargingGame"
					element={
						<ProtectedRoute>
							<RobotChargingGame />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/DebuggerGame"
					element={
						<ProtectedRoute>
							<DebuggerGame />
						</ProtectedRoute>
					}
				/>
				
				<Route
					path="/DebuggingGameApp"
					element={
						<ProtectedRoute>
							<ElevaterGame />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/ChatBot"
					element={
						<ProtectedRoute>
							<ChatBot />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/Codeanalyser"
					element={
						<ProtectedRoute>
							<CodeEditor />
						</ProtectedRoute>
					}
				/>
				
				<Route
					path="/Contact"
					element={
						<ProtectedRoute>
							<ContactForm/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/LearningGame"
					element={
						<ProtectedRoute>
							<LearningGame/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/Messenger"
					element={
						<ProtectedRoute>
							<MessengerGame/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/LogicGame"
					element={
						<ProtectedRoute>
							<LogicGame/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/BubbleSort"
					element={
						<ProtectedRoute>
							<BubbleSortGame/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/Community"
					element={
						<ProtectedRoute>
							<CommunityForum/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/BridgeGame"
					element={
						<ProtectedRoute>
							<BridgeGame/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/MazeGame"
					element={
						<ProtectedRoute>
							<MazeGame/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/FifoGame"
					element={
						<ProtectedRoute>
							<FifoGame/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/InsertionGame"
					element={
						<ProtectedRoute>
							<InsertionGame/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/LifoGame"
					element={
						<ProtectedRoute>
							<LifoGame/>
						</ProtectedRoute>
					}
				/>
                <Route
					path="/DebugGame"
					element={
						<ProtectedRoute>
							<DebugGame/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/Dashboarduser"
					element={
						<ProtectedRoute>
							<DashboardUser/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/leaderboard"
					element={
						<ProtectedRoute>
							<Leaderboard/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/passwordcrack"
					element={
						<ProtectedRoute>
							<PasswordCrack/>
						</ProtectedRoute>
					}
				/>
				<Route
					path="/elevater"
					element={
						<ProtectedRoute>
							<Elevater/>
						</ProtectedRoute>
					}
				/>



<Route
         path="/admin/dashboard" 
					element={
						<ProtectedRoute>
							<AdminDashboard />
						</ProtectedRoute>
					}
				/>


				

				{/* Catch-All Route */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
			<Toaster />
		</div>
	);
}

export default App;
