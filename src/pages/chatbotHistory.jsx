import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Card, Button } from "flowbite-react";
import axios from "axios";
import monye from "../assets/image/monye.png";
import profile from "../assets/image/profile-chatbot.png";
import userImage from "../assets/image/user.png";
import { IoSend, IoLogoWechat } from "react-icons/io5";
import { IoTrashOutline } from "react-icons/io5";

const ChatbotHistory = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState("your-user-id"); // Ganti dengan ID pengguna yang sebenarnya
  const [fullname, setFullname] = useState("User"); // Ganti dengan nama lengkap pengguna yang sebenarnya
  const [error, setError] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const inactivityLimit = 30000; // 30 detik
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

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Token is missing');
        }
    
        const response = await axios.get("http://localhost:5000/get_chat_session", {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
    
        if (response.status === 200) {
          setSessions(response.data.sessions);
        } else {
          throw new Error(`Unexpected response status: ${response.status}`);
        }
      } catch (error) {
        if (error.response) {
          console.error('Response error:', error.response.status, error.response.data);
          setError(`Error fetching chat sessions: ${error.response.status}`);
        } else if (error.request) {
          console.error('Request error:', error.request);
          setError('Error fetching chat sessions: No response received');
        } else {
          console.error('Error message:', error.message);
          setError(`Error fetching chat sessions: ${error.message}`);
        }
      }
    };
    

    fetchChatSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      const fetchChatHistory = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            throw new Error('Token is missing');
          }
      
          const response = await axios.get(`http://localhost:5000/get_chat_history/${selectedSession}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
      
          if (response.status === 200) {
            // Periksa data yang diterima
            console.log('Received data:', response.data);
      
            // Ambil chat_history dari data yang diterima
            const chatHistory = response.data.chat_history;
      
            if (Array.isArray(chatHistory)) {
              // Format chatHistory jika data valid
              const formattedMessages = chatHistory.map(msg => ({
                text: msg.content,
                sender: msg.sender,
                time: new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }));
              setMessages(formattedMessages);
            } else {
              console.error('Invalid data format:', response.data);
              setError('Error: Invalid data format.');
            }
          } else {
            throw new Error(`Unexpected response status: ${response.status}`);
          }
        } catch (error) {
          console.error('Error fetching chat history:', error);
          setError('Error fetching chat history.');
        }
      };
      
      
      
      
  
      fetchChatHistory();
    }
  }, [selectedSession]);

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
        const newSessionId = response.data.session_id;
        setSessionId(newSessionId);
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
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      setError('Error initializing session. Please try again later.');
    }
  };

  const resetInactivityTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(endSession, inactivityLimit);
  };

  const endSession = async () => {
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
        setError("Error with the Flask API.");
      }
    }
  };

  const handleNewChat = async () => {
    navigate('/chatbot');
    try {
      await initializeSession();
      setMessages([]);
    } catch (error) {
      console.error('Error starting a new chat:', error);
      setError('Error starting a new chat. Please try again.');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleSessionClick = (session_id) => {
    setSelectedSession(session_id);
  };

const handleDeleteChat = async () => {
  if (!selectedSession) {
    console.error('No session selected');
    return;
  }

  const isConfirmed = window.confirm('Are you sure you want to delete this chat session?');
  if (!isConfirmed) {
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token is missing');
      return;
    }

    const response = await axios.delete(`http://localhost:5000/delete_chat_session/${selectedSession}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 200) {
      setSessions(sessions.filter(session => session.session_id !== selectedSession));
      setSelectedSession(null);
      setMessages([]);
    } else {
      console.error(`Failed to delete chat session: ${response.status}`);
      setError('Failed to delete chat session. Please try again.');
    }
  } catch (error) {
    console.error('Error deleting chat session:', error.response ? error.response.data : error.message);
    setError('Error deleting chat session.');
  }
};

  

  return (
    <div className="flex flex-row items-start h-screen p-4">
      {/* Panel Riwayat Chat */}
      <div className="w-1/4 max-w-full h-full p-2">
        <Card className="h-full flex flex-col bg-slate-300">
          <div className="p-4 pb-0 flex flex-row items-center text-2xl text-gray-700">
            <IoLogoWechat />
            <h2 className="font-bold ms-2">Chat History</h2>
          </div>
          <div className="p-4">
            <Button onClick={handleNewChat} color="light" size="lg" className="w-60" pill>
              Chat Monbot
            </Button>
          </div>
          <div className="overflow-y-auto">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <Button
                  key={session.session_id}
                  className="block w-full text-left mt-2"
                  onClick={() => handleSessionClick(session.session_id)}
                >
                  Session {session.session_id}
                </Button>
              ))
            ) : (
              <p>No sessions available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Chatbot Panel */}
      <div className="flex-1 max-w-full h-full p-2">
        <Card className="h-full flex flex-col bg-slate-100">
         <div className="flex items-center p-4 bg-customBiru6 rounded-t-lg gap-4">
          <div className="p-4 pb-0 flex flex-row items-center text-2xl text-gray-700">
          <div className="relative">
              <img className="w-12 h-12 rounded-full" src={profile} alt="" />
              <span className="absolute bottom-0 left-9 transform translate-y-1/5 w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 ml-3">Monbot</h2>
              <p className="text-sm text-white ml-3">Online</p>
            </div>
          <h2 className="ml-10">{selectedSession ? `Chat - Session ${selectedSession}` : "Select a session"}</h2>
            </div>
            <div className="ml-auto">
              <button onClick={handleDeleteChat} className="p-2 bg-transparent border-none cursor-pointer">
                <IoTrashOutline size={30} color="gray" />
              </button>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto p-4">
          {messages.length > 0 ? (
              messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-2.5 mb-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <img
                    className="w-7 h-7 ring-2 ring-gray-300 dark:ring-gray-500 rounded-full"
                    src={message.sender === "user" ? userImage : monye}
                    alt={message.sender === "user" ? "User" : "Bot"}
                  />
                  <div className={`p-2 rounded-lg max-w-xs ${message.sender === 'user' ? 'bg-blue-300 text-white' : 'bg-gray-300 text-black'}`}>
                    <div className="text-sm">{message.text}</div>
                    <div className="text-xs text-gray-500 text-right">
                      {message.time ? new Date(message.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : 'No timestamp'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No messages yet</p>
            )}



          </div>



          <div className="p-4 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-2 border rounded-lg"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSend}
              className="ml-2 p-2 bg-blue-500 text-white rounded-lg"
            >
              <IoSend size={24} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotHistory;
