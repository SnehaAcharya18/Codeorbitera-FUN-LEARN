import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import LabImage from "../assets/images/level7/lab.png";
import bubble from "../assets/images/level7/bubble.jpg";
import stack from "../assets/images/midlevel11/b8.png";
import que from "../assets/images/level5/island7.png";
import back from "../assets/hero/hero.png";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const font = document.createElement("link");
    font.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800&display=swap";
    font.rel = "stylesheet";
    document.head.appendChild(font);

    const fontPressStart = document.createElement("link");
    fontPressStart.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap";
    fontPressStart.rel = "stylesheet";
    document.head.appendChild(fontPressStart);
  }, []);

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about-us");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const dsaGames = [
    { name: "Bubble Sort", image: bubble, path: "/login" },
    { name: "Insertion Sort", image: LabImage, path: "/login" },
    { name: "Stacks", image: stack, path: "/login" },
    { name: "Queue", image: que, path: "/login" },
  ];

  const codingGames = [
    {
      name: "Elevator Crash",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      path: "/login",
    },
    {
      name: "Debugger",
      image: "https://images.unsplash.com/photo-1534665482403-a909d0d97c67",
      path: "/login",
    },
    {
      name: "Hacker",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3",
      path: "/login",
    },
  ];

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-slate-900 via-zinc-800 to-yellow-900 text-white font-orbitron overflow-x-hidden flex flex-col">
      <main className="flex flex-col flex-grow">
        {/* Navbar */}
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
              onClick={() => navigate("/")}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-lg w-full sm:w-auto font-bold"
            >
              Home
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={scrollToAbout}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-lg w-full sm:w-auto font-bold"
            >
              About
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/contact")}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-700 via-indigo-700 to-yellow-500 text-white rounded-lg shadow font-pressStart text-xs sm:text-lg w-full sm:w-auto font-bold"
            >
              Contact
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/login")}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 text-black rounded-lg shadow font-pressStart text-base sm:text-xl w-full sm:w-auto font-bold"
            >
              Login
            </motion.button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row justify-between items-center py-12 px-6 sm:px-8 lg:px-16 gap-4 sm:gap-6 flex-grow">
          <motion.div
            className="space-y-6 max-w-lg text-left "
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)] font-orbitron">
              CODE ORBITERA
            </h1>
            <p className="text-base sm:text-lg lg:text-xl font-semibold font-orbitron">
              Compete with <span className="text-yellow-400">Monsters</span> in epic coding challenges and master programming concepts.
            </p>
            <p className="text-base sm:text-lg lg:text-xl font-medium font-orbitron">Our top games await your challenge. Start your coding adventure today!</p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link
                to="/login"
                className="bg-yellow-400 text-black px-6 sm:px-8 py-3 rounded-full font-bold hover:bg-yellow-300 text-base sm:text-lg lg:text-xl font-orbitron transition-colors"
              >
                Challenge Now
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-96 lg:h-96">
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-yellow-400 rounded-full overflow-hidden">
              <img
                src={back}
                alt="Hero character"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </section>

        {/* DSA Games */}
        <section className="py-12 bg-gradient-to-b from-slate-800 to-yellow-900">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-yellow-400 mb-8 font-orbitron">DSA GAMES</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 px-6 max-w-7xl mx-auto">
            {dsaGames.map((game, index) => (
              <motion.div
                key={index}
                className="relative w-full aspect-[3/4] max-h-28 sm:max-h-36 rounded-lg shadow-lg overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate(game.path)}
              >
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-base sm:text-lg lg:text-xl font-semibold font-orbitron">{game.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Coding Games */}
        <section className="py-12 bg-gradient-to-t from-slate-900 to-yellow-900">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-yellow-400 mb-8 font-orbitron">CODING GAMES</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 px-6 max-w-7xl mx-auto">
            {codingGames.map((game, index) => (
              <motion.div
                key={index}
                className="relative w-full aspect-square max-h-28 sm:max-h-36 rounded-lg shadow-lg overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onClick={() => navigate(game.path)}
              >
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-base sm:text-lg lg:text-xl font-semibold font-orbitron">{game.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* About Us + Certificate */}
        <section id="about-us" className="py-12 px-6 sm:px-8 lg:px-16 bg-black text-center flex-grow">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-yellow-400 mb-8 font-orbitron">About Us</h2>
          <p className="text-base sm:text-lg lg:text-xl font-medium max-w-3xl mx-auto mb-8 font-orbitron">
            At Code Orbitera, we make learning to code fun and accessible. Our engaging games help you master programming principles effortlessly.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 max-w-5xl mx-auto">
            <div className="relative h-28 sm:h-36 rounded-lg shadow-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
                alt="Team collaboration"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center">
              <p className="text-base sm:text-lg lg:text-xl font-medium font-orbitron">
                Our games feature score points to keep you motivated while mastering Data Structures and Algorithms. Start your coding journey today!
              </p>
            </div>
          </div>

          <div className="bg-yellow-100 text-black rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-4 font-orbitron">Unlock Your Certificate</h3>
            <p className="mb-6 text-base sm:text-lg lg:text-xl font-medium font-orbitron">Get rewarded for your learning journey!</p>
            <ul className="list-disc list-inside text-left mb-6 text-base sm:text-lg lg:text-xl font-medium font-orbitron">
              <li>Recognized certificate of completion</li>
              <li>Proof of coding competency</li>
              <li>Shareable on LinkedIn and resumes</li>
              <li>Priority access to advanced levels</li>
              <li>Mentor guidance for next steps</li>
            </ul>
            <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2 px-6 rounded-full shadow-lg transition text-base sm:text-lg lg:text-xl font-orbitron">
              Pay ₹199 to Get Certificate
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 py-8 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 sm:px-8 lg:px-16 max-w-7xl mx-auto">
            <div>
              <h3 className="text-yellow-400 font-extrabold text-lg sm:text-xl lg:text-2xl font-orbitron mb-4">Short Links</h3>
              <ul className="space-y-2 text-base sm:text-lg font-orbitron">
                {["Home", "About", "Contact", "Games", "Help"].map((item, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-yellow-400 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-extrabold text-lg sm:text-xl lg:text-2xl font-orbitron mb-4">Get in Touch</h3>
              <ul className="space-y-2 text-base sm:text-lg font-orbitron">
                {["Facebook", "Instagram", "Twitter", "LinkedIn"].map((social, idx) => (
                  <li key={idx}>
                    <a href="#" className="hover:text-yellow-400 flex items-center space-x-2 transition-colors">
                      <span>{social}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="text-yellow-400 font-extrabold text-lg sm:text-xl lg:text-2xl font-orbitron mb-4">Contact Us</h3>
              <p className="text-base sm:text-lg font-orbitron">Email: support@codeorbitera.com</p>
              <p className="text-base sm:text-lg font-orbitron">Phone: +91 123-456-7890</p>
            </div>
          </div>
          <div className="text-center text-gray-400 mt-8 text-base sm:text-lg font-orbitron bg-gray-950 py-4">
            <p>© 2025 Code Orbitera. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;