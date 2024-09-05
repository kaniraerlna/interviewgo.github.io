import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Card, Button } from "flowbite-react";
import axios from "axios";
import monye from "../assets/image/monye.png";
import profile from "../assets/image/profile-chatbot.png";
import userImage from "../assets/image/user.png";
import { IoSend, IoLogoWechat } from "react-icons/io5";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState("your-user-id"); // Replace with actual user ID
  const [fullname, setFullname] = useState("User"); // Replace with actual user's full name
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const inactivityLimit = 30000; // 30 seconds
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFullname = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Token is missing!');
          return;
        }

        const response = await axios.get('http://localhost:5000/get_user_info', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200) {
          setFullname(response.data.user.fullname);
        } else {
          setError('Error fetching full name.');
        }
      } catch (error) {
        setError('Error fetching full name.');
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };

    fetchFullname();
  }, []);

  const initializeSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token is missing');
      }
  
      const response = await axios.post("http://127.0.0.1:5000/start_session", {
        user_id: userId,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.status === 200) {
        setSessionId(response.data.session_id);
        setMessages([
          {
            text: `Hello ${fullname}, how can I assist you today?`,
            sender: "bot",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
        setChatHistory(response.data.chat_history || []);
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setError('Error initializing session. Please try again later.');
    }
  };
  

  useEffect(() => {
    initializeSession();
  }, [userId, fullname]);
  
  const resetInactivityTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(endSession, inactivityLimit);
  };

  const saveChatHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing");
      }
  
      await axios.post(
        "http://127.0.0.1:5000/save_chat_history",
        {
          user_id: userId,
          session_id: sessionId,
          chat_history: messages,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error saving chat history:", error);
      setError("Error saving chat history.");
    }
  };
  

  const endSession = async () => {
    await saveChatHistory();
    try {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "Session chat has ended.",
          sender: "bot",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setSessionId(null);
      setMessages([]);
  
      // Fetch a new session and update the state
      await initializeSession();
    } catch (error) {
      setError('Error ending session.');
    }
  };
  

  const handleSend = async () => {
    if (input.trim() && sessionId) {
      const userMessage = input.trim();
      const currentTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

  
      setMessages([...messages, { text: userMessage, sender: "user", time: currentTime }]);
      setInput("");

      resetInactivityTimer();

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing!");
          return;
        }

        // Send user message
        await axios.post(
          "http://127.0.0.1:5000/send_message",
          {
            session_id: sessionId,
            user_id: userId,
            message: userMessage,
            sender: "user",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Get bot response
        const response = await axios.post(
          "http://127.0.0.1:5000/predict",
          { message: userMessage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: response.data.response,
            sender: "bot",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        // Send bot response
        await axios.post(
          "http://127.0.0.1:5000/send_message",
          {
            session_id: sessionId,
            user_id: userId,
            message: response.data.response,
            sender: "bot",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error("Error with the Flask API:", error);
        console.error(
          "Error details:",
          error.response ? error.response.data : error.message
        );
        setError("Error with the Flask API.");
      }
    }
  };

  const handleNewChat = () => {
    initializeSession();
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleClick = () => {
    // Navigate to the chatbotHistory section or route
    navigate('/chatbotHistory');  // Adjust the path according to your routing setup
  };

  const handleEndSession = () => {
    endSession();
  };
  

  return (
    <div className="flex flex-row items-start h-screen p-4">
      {/* Chat history panel */}
      <div className="w-1/4 max-w-full h-full p-2">
        <Card className="h-full flex flex-col bg-slate-300">
          <div className="p-4 pb-0 flex flex-row items-center text-2xl text-gray-700">
            <IoLogoWechat />
            <div>
            <h2 
                className="font-bold ms-2 cursor-pointer text-blue-500 hover:underline" 
                onClick={handleClick}
            >
                Chat History
            </h2>
            {/* Your other component code */}
            </div>
          </div>
          <div className="p-4">
            <Button onClick={handleNewChat} color="light" size="lg" className="w-60" pill>
              New Chat
            </Button>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
            {chatHistory.map((history, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm text-gray-600">{history}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Chatbot panel */}
      <div className="w-3/4 max-w-full h-full flex flex-col p-2">
        <Card className="w-full h-full flex flex-col">
          <div className="flex items-center p-4 bg-customBiru6 rounded-t-lg gap-4">
            <div className="relative">
              <img className="w-12 h-12 rounded-full" src={profile} alt="" />
              <span className="absolute bottom-0 left-9 transform translate-y-1/5 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Monbot</h2>
              <p className="text-sm text-white">Online</p>
            </div>
            <div className="flex-grow flex justify-end items-center mr-5">
            <Button
                onClick={handleEndSession}
                color="failure"
                size="lg"
                className="rounded-m"
                pill
              >
                End Session
              </Button>
              </div>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-2.5 mb-2 ${
                  message.sender === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <img
                  className="w-7 h-7 ring-2 ring-gray-300 dark:ring-gray-500 rounded-full"
                  src={message.sender === "user" ? userImage : monye}
                  alt={message.sender === "user" ? "User" : "Logo"}
                />
                <div className="flex flex-col gap-1 max-w-[320px]">
                  <div
                    className={`flex items-center space-x-2 rtl:space-x-reverse ${
                      message.sender === "user" ? "gap-2 flex-row-reverse" : ""
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {message.sender === "user" ? "You" : "Monbot"}
                    </span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      {message.time}
                    </span>
                  </div>
                  <div
                    className={`flex flex-col w-full max-w-[500px] leading-1.5 py-0 p-4 border-gray-200 rounded-e-xl rounded-es-xl ${
                      message.sender === "user"
                        ? "bg-blue-100 dark:bg-blue-700 rounded-l-xl rounded-tr-none"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <p className="text-sm font-normal py-2.5 text-gray-900 dark:text-white break-words">
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              className="flex-grow border rounded-full px-4 py-2"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <Button onClick={handleSend} className="bg-customBiru6" size="lg">
              <IoSend />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chatbot;