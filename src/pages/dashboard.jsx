import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertCircle } from 'react-icons/fi';
import chatbot from '../assets/image/chatbot.jpg';
import speaking from '../assets/image/speaking.jpg';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/navbar';

const Dashboard = () => {
  const cardData = [
    {
      title: 'Interview Test',
      description: 'Practice your interview skills with our comprehensive test.',
      buttonText: 'Test Now',
      image: speaking,
      link: '/history',
    },
    {
      title: 'Monbot',
      description: 'Need help? Ask Monbot anything and get answers instantly.',
      buttonText: 'Chat Now',
      image: chatbot,
      link: '/chatbot',
    },
  ];

  const [fullname, setFullname] = useState('');
  const [helloText, setHelloText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullname = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('Token is missing!');
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
          console.error('Error fetching full name:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching full name:', error.message);
        if (error.response && error.response.status === 401) {
          console.log('Token is expired or invalid, redirecting to login page...');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFullname();
  }, []);

  useEffect(() => {
    const helloUserText = `Hello ${fullname || 'User'}!`;
    let i = 0;
    const typingInterval = setInterval(() => {
      setHelloText(helloUserText.substring(0, i + 1));
      i++;
      if (i === helloUserText.length) {
        setTimeout(() => {
          setHelloText('');
          i = 0;
        }, 5000);
      }
    }, 100);
    setTyping(true);

    return () => {
      clearInterval(typingInterval);
    };
  }, [fullname]);

  return (
    <div className="min-h-screen bg-customBiru4">
      <Navbar/>
      <div className="max-w-6xl mx-auto text-center py-8 px-4">
        <AnimatePresence> 
          {typing && (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-3xl md:text-4xl font-bold text-white mb-8"
            >
              {helloText}
            </motion.h1>
          )}
        </AnimatePresence>
        {!typing && (
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Hello {fullname || 'User'}!
          </h1>
        )}
        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {cardData.map((card, index) => (
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md hover:shadow-lg"
              >
                <Link to={card.link} className="block">
                  <img src={card.image} alt={`${card.title} Image`} className="rounded-t-lg w-full h-48 object-cover" />
                </Link>
                <div className="p-6">
                  <Link to={card.link} className="block">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 hover:text-blue-600 transition duration-300">
                      {card.title}
                    </h2>
                  </Link>
                  <p className="text-sm text-gray-600 mb-4">
                    {card.description}
                  </p>
                  <Link
                    to={card.link}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300"
                  >
                    {card.buttonText}
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
