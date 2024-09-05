import React from 'react';
import { motion } from 'framer-motion';
import Dea from '../assets/image/Dea.jpg';
import Gianna from '../assets/image/Gianna.png';
import Daffara from '../assets/image/Daffara.png';
import Kanira from '../assets/image/Kanira.jpg';
import Navbar from '../components/navbar';

const people = [
  {
    name: 'Daffara Chairunnisa Z.',
    role: 'Back-end Developer',
    imageUrl: Daffara,
  },
  {
    name: 'Dea Luthfina A.',
    role: 'Back-end Developer',
    imageUrl: Dea,
  },
  {
    name: 'Gianna Nasya O.I.',
    role: 'Front-end Developer',
    imageUrl: Gianna,
  },
  {
    name: 'Kanira Erliana A. Z.',
    role: 'Front-end Developer',
    imageUrl: Kanira,
  },
];

const About = () => {
  return (
    <div className="bg-gradient-to-b from-white via-blue-100 to-white min-h-screen pb-20">
      <Navbar/>
      {/* About Us Section */}
      <div className="flex items-center justify-center py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            className="relative z-10 p-8 md:p-16 bg-gray-800 shadow-2xl rounded-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              About Us
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-12 max-w-3xl mx-auto">
              We are dedicated to helping professionals succeed in their careers by providing top-notch interview preparation tools and resources.
            </p>
            <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-12 max-w-3xl mx-auto">
              Our mission is to empower job seekers with the skills and confidence they need to excel in interviews and secure their dream jobs.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Team Section */}
      <div className="text-center py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-5xl mb-12">Meet the <strong>Team</strong></p>
          <ul
            role="list"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-y-16 xl:col-span-2 mt-10"
          >
            {people.map((person) => (
              <motion.li
                key={person.name}
                className="flex flex-col items-center"
                whileHover={{ scale: 1.0 }}
              >
                <motion.img
                  alt={person.name}
                  src={person.imageUrl}
                  className="rounded-full object-cover mb-4 grayscale-img"
                  style={{ width: '100px', height: '100px' }}
                  whileHover={{ scale: 1.1, rotate: 3}}
                  transition={{ duration: 0.2 }}
                />
                <div className="text-center">
                  <motion.h3
                    className="text-2xl font-bold text-gray-900 mb-2"
                    whileHover={{ color: '#4F46E5', scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    {person.name}
                  </motion.h3>
                  <motion.p
                    className="text-lg font-semibold text-indigo-600"
                    whileHover={{ scale: 1.05 }}
                  >
                    {person.role}
                  </motion.p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
