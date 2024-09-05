import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function History() {
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log("Fetching history data with token:", token); // Log the token
        const response = await axios.get("http://localhost:5000/history", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("History data:", response.data); // Log the response
        setHistoryData(response.data);
      } catch (error) {
        console.error("Error fetching history data:", error);
        setError("Failed to load history data. Please try again later.");
      }
    };

    fetchHistoryData();
  }, []);

  const handleRowClick = (session_id) => {
    navigate(`/summary/${session_id}`);
  };

  const getGradeDescription = (grade) => {
    switch (grade) {
      case 1:
        return { text: "Bad", colorClass: "text-red-600" };
      case 2:
        return { text: "Nice try", colorClass: "text-orange-600" };
      case 3:
        return { text: "Good", colorClass: "text-yellow-600" };
      case 4:
        return { text: "Excellent", colorClass: "text-blue-600" };
      case 5:
        return { text: "Awesome", colorClass: "text-green-600" };
      default:
        return { text: "Unknown", colorClass: "text-gray-500" };
    }
  };

  return (
    <div className="min-h-screen bg-customBiru4 py-10 px-10">
      <div className="nav-page mb-4">
        <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          <li className="inline-flex items-center">
            <a
              href="/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                className="w-3 h-3 me-2.5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              Home
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
              <a className="ms-1 text-sm font-medium text-gray-300 md:ms-2 dark:text-gray-400">
                History Interview Test
              </a>
            </div>
          </li>
        </ol>
      </div>
      <div className="bg-white rounded shadow p-12">
        <div className="flex justify-between mb-4">
          <div className="title">
            <div>
              <h1 className="text-2xl font-semibold">
                <i className="ri-file-list-3-line me-2"></i>
                History Interview Test
              </h1>
            </div>
            <div className="mt-2 font-semibold text-gray-400">
              <p className="italic text-sm">All your history interview</p>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="outline outline-offset-2 outline-customBiru3 bg-gradient-to-r from-customBiru3 to-customBiru6 text-white py-2 px-6 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:from-customBiru4 hover:to-customBiru3"
            >
              <Link to="/features">Test Now</Link>
            </motion.button>
          </div>
        </div>
        <div className="mt-10">
          {error && <div className="error-message text-red-500">{error}</div>}
          <div className="mt-4 max-h-96 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                <tr className="bg-gray-200">
                  <th className="py-4 px-6 text-left">KATEGORI</th>
                  <th className="py-4 px-6 text-center">GRADE</th>
                  <th className="py-4 px-6 text-right">DATE</th>
                </tr>
              </thead>
              <tbody className="text-base">
                {historyData.length > 0 ? (
                  historyData.map((item) => {
                    const { text, colorClass } = getGradeDescription(item.grade);
                    return (
                      <motion.tr
                        key={item.session_id} // Ensure session_id is used here
                        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
                        className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 cursor-pointer"
                        onClick={() => handleRowClick(item.session_id)} // Corrected parameter
                      >
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {item.category}
                        </td>
                        <td className={`text-center py-4 px-6 ${colorClass}`}>
                          {text} {/* Display the grade description */}
                        </td>
                        <td className="text-right py-4 px-6">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="py-4 px-6 text-center text-gray-500">
                      No history data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default History;
