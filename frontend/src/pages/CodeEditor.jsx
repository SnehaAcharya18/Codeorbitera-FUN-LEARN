import { useState, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// React-Codemirror 6
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

export default function CodeEditor() {
  const [code, setCode] = useState('// Write your code here');
  const [language, setLanguage] = useState('python');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNavigateToCodeAnalyzer = () => {
    navigate("/Codeanalyser");
  };

  const languageMap = {
    cpp: { lang: 'cpp', versionIndex: '5', extension: cpp },
    java: { lang: 'java', versionIndex: '4', extension: java },
    python: { lang: 'python3', versionIndex: '4', extension: python },
    javascript: { lang: 'javascript', versionIndex: '4', extension: javascript },
  };

  const runCode = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/Codeanalyser',
        {
          script: code,
          language: languageMap[language].lang,
          versionIndex: languageMap[language].versionIndex,
          stdin: input,
        }
      );
      setOutput(res.data.output);
    } catch (err) {
      setOutput('❌ Error: ' + err.message);
    }
    setLoading(false);
  }, [code, input, language]);

  const langExtension = languageMap[language].extension();

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-gray-900 text-white font-sans flex flex-col">
      {/* Top Navbar */}
      <nav className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3 bg-black bg-opacity-40 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <div className="w-8 sm:w-10 h-8 sm:h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold font-orbitron">
            C
          </div>
          <span className="text-lg sm:text-xl font-bold font-orbitron">Code Orbitera</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => window.location.href = 'dashboard'}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 text-white rounded shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Dashboard
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/Community")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 text-white rounded shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Community Forum
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/contact")}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 text-white rounded shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Contact Us
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={handleNavigateToCodeAnalyzer}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-slate-700 via-purple-800 to-yellow-500 text-white rounded shadow font-pressStart text-xs sm:text-sm w-full sm:w-auto"
          >
            Code Analyzer
          </motion.button>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden px-2 sm:px-4 pb-2">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-900 rounded-lg p-3">
          <div className="mb-3 flex justify-between items-center">
            <h3 className="text-xl sm:text-2xl">🧠 Online Code Editor</h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-700 text-white border border-gray-500 rounded-lg p-2 text-sm sm:text-base"
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          {/* Editor fills available space */}
          <div className="flex-1 overflow-auto min-h-0">
            <CodeMirror
              value={code}
              theme={oneDark}
              height="100%"
              extensions={[langExtension]}
              onChange={(value) => setCode(value)}
              className="rounded-lg"
              style={{ fontSize: '0.9rem' }}
            />
          </div>

          {/* Button stays visible */}
          <button
            onClick={runCode}
            className="mt-3 w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold cursor-pointer text-sm sm:text-base hover:bg-blue-500"
          >
            {loading ? '⏳ Running...' : '▶️ Run Code'}
          </button>
        </div>

        {/* Right: I/O */}
        <div className="w-full sm:w-[350px] bg-gray-700 p-4 flex flex-col min-h-0 mt-4 sm:mt-0 sm:ml-4 rounded-lg">
          {/* Smaller Input */}
          <div>
            <label className="mb-2 font-bold text-sm sm:text-lg block">
              Standard Input (Optional):
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-20 bg-gray-900 text-white border border-gray-500 rounded-lg p-2.5 font-mono resize-none text-sm sm:text-base"
            />
          </div>

          {/* Bigger Output */}
          <div className="flex-1 mt-4 bg-gray-900 text-gray-300 border border-gray-500 rounded-lg p-2.5 font-mono overflow-y-auto whitespace-pre-wrap text-sm sm:text-base min-h-0">
            <strong className="text-base sm:text-lg">🔎 Output:</strong>
            <br />
            {output}
          </div>
        </div>
      </div>
    </div>
  );
}