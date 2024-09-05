import React from 'react';
import logo from "../assets/image/logo.png";
import { useNavigate } from "react-router-dom";
import demoDashboard from "../assets/video/demoDashboard.mp4";
import demoInterview from "../assets/video/demoInterview.mp4";
import demoFeedback from "../assets/video/demoFeedback.mp4";
import { Badge, List } from "flowbite-react";
import {
  HiCheckCircle,
  HiOutlineMicrophone,
  HiArrowSmRight,
  HiOutlineXCircle,
} from "react-icons/hi";
import Navbar from '../components/navbar';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="bg-gradient-to-b from-sky-100 to-white min-h-screen items-center justify-center">
      <Navbar/>
      <div className="pt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center mb-8">
          <img src={logo} alt="Logo" className="h-48 w-auto" />
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Helps you prepare for{" "}
          <span className="text-customBiru3">job interviews</span> with
          confidence and top-notch skills.
        </h1>
        <p className="text-2xl text-gray-600 mb-6 max-w-3xl mx-auto">
          With our advanced features, you will be prepared for every question
          and challenge in the job selection process.
        </p>
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleGetStarted}
            className="mt-6 outline outline-offset-2 outline-4 outline-customBiru3 bg-gradient-to-r from-customBiru3 to-customBiru6 text-white py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:from-customBiru4 hover:to-customBiru3"
          >
            Get Started
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 p-4 sm:px-6 lg:px-8 text-center">
        <div className="justify-center pb-8">
          <h1 className="text-xl font-bold text-customBiru3">How It Works?</h1>
          <h1 className="text-2xl text-gray-500">
            Get hired quicker by having one up on your opponents by being more
            prepared
          </h1>
        </div>
        <div className="flex flex-row mt-10 items-center">
          <div className="flex-1 text-black font-semibold px-10">
            <h1 className="text-start text-xl">Step 1 - Choose questions</h1>
            <h1 className="text-start text-lg font-light text-gray-500">
              Don't get nervous the moment your interview starts. Practice with
              us beforehand and get ready for the real interview.
            </h1>
            <List className="font-light text-base mt-4 text-green-400">
              <List.Item icon={HiCheckCircle}>
                <span className="text-gray-500">
                  Behavioral and technical questions
                </span>
              </List.Item>
              <List.Item icon={HiCheckCircle}>
                <span className="text-gray-500">
                  Works for all job descriptions and industries
                </span>
              </List.Item>
              <List.Item icon={HiCheckCircle}>
                <span className="text-gray-500">Human-like Communication</span>
              </List.Item>
            </List>
          </div>
          <div className="flex-1">
            <video src={demoDashboard} alt="demo1" autoPlay loop muted />
          </div>
        </div>
        <div className="flex flex-row mt-24 items-center">
          <div className="flex-1">
            <video src={demoInterview} alt="demo1" autoPlay loop muted />
          </div>
          <div className="flex-1 text-black font-semibold ps-10">
            <h1 className="text-start text-xl">Step 2 - Practice answering</h1>
            <h1 className="text-start text-lg font-light text-gray-500">
              Record your answer with{" "}
              <span className="text-blue-400">audio or text</span>, simulating
              the interview experience.
            </h1>
            <List className="font-light text-base mt-4 text-green-400">
              <List.Item icon={HiCheckCircle}>
                <span className="text-gray-500">
                  Multiple input options to answer (audio/text)
                </span>
              </List.Item>
              <List.Item icon={HiCheckCircle}>
                <span className="text-gray-500">Data is private</span>
              </List.Item>
              <List.Item icon={HiCheckCircle}>
                <span className="text-gray-500">Gain more knowledge</span>
              </List.Item>
            </List>
          </div>
        </div>
        <div className="flex flex-row mt-24 items-center">
          <div className="flex-1 text-black font-semibold px-10">
            <h1 className="text-start text-xl">
              Step 3 - Improve with Feedback
            </h1>
            <h1 className="text-start text-lg font-light text-gray-500">
              Gain a competitive edge with actionable{" "}
              <span className="text-blue-400">feedback</span> and{" "}
              <span className="text-blue-400">sample response</span>. Enhance
              your interview skills and leave a lasting impression.
            </h1>
            <List className="font-light text-base mt-4 text-green-400">
              <List.Item icon={HiCheckCircle}>
                <span className="text-gray-500">
                  Receive constructive criticism
                </span>
              </List.Item>
              <List.Item icon={HiCheckCircle}>
                <span className="text-gray-500">
                  Identify areas for improvement
                </span>
              </List.Item>
              <List.Item icon={HiCheckCircle}>
                <span className="text-gray-500">
                  Implement feedback effectively
                </span>
              </List.Item>
            </List>
          </div>
          <div className="flex-1">
            <video src={demoFeedback} alt="demo1" autoPlay loop muted />
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={handleGetStarted}
          className="mt-6 outline outline-offset-2 outline-4 outline-customBiru3 bg-gradient-to-r from-customBiru3 to-customBiru6 text-white py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:from-customBiru4 hover:to-customBiru3 flex flex-row items-center gap-2"
        >
          {" "}
          <HiOutlineMicrophone className="text-xl" />
          Start an interview
        </button>
      </div>
      <Badge color="gray" className="m-16 p-12">
        <div className="flex flex-row items-center justify-center">
          <h1 className="flex-1 text-4xl font-extrabold">
            Make your next job interview stress free thanks to InterviewGo!
          </h1>
          <div className="flex-1 gap-2 ms-10">
            <div className="flex flex-col">
              <div className="flex flex-row text-center w-5/6 mb-4 font-normal text-base">
                <p className="flex-1">Without InterviewGo!</p>
                <p className="flex-1">With InterviewGo!</p>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="grow flex flex-col gap-4">
                  <Badge color="failure" className="p-6 text-xl justify-center">Unprepared</Badge>
                  <Badge color="failure" className="p-6 text-xl justify-center">Nervous</Badge>
                  <Badge color="failure" className="p-6 text-xl justify-center">Ghosted</Badge>
                </div>
                <div className="grow-0 flex flex-col gap-16 text-xl justify-center">
                  <HiArrowSmRight />
                  <HiArrowSmRight />
                  <HiArrowSmRight />
                </div>
                <div className="grow flex flex-col gap-4">
                  <Badge color="success" className="p-6 text-xl justify-center w-64">Organized and ready</Badge>
                  <Badge color="success" className="p-6 text-xl justify-center w-64">Confident answers</Badge>
                  <Badge color="success" className="p-6 text-xl justify-center w-64">Receive final offers</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Badge>
    </div>
  );
};

export default Landing;
