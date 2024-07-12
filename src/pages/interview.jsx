import React, { useState, useEffect } from "react";
import mic from "../assets/image/mic.jpg";
import { Button } from "flowbite-react";

function Interview() {
  const [isRecording, setIsRecording] = useState(false);
  const [question, setQuestion] = useState("");
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFeedback, setIsFeedback] = useState(false); // Menambahkan state untuk melacak sesi feedback
  const [feedback, setFeedback] = useState(""); // Menambahkan state untuk menyimpan feedback
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [isRecording]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleStopRecording();
      setTimeLeft(60);
    }
  }, [timeLeft]);

  const handleStartRecording = async () => {
    if (!hasPermission) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setHasPermission(true);
        setStream(stream);
      } catch (error) {
        console.error("Error requesting microphone permission:", error);
        return;
      }
    }
    if (hasPermission) {
      setIsRecording(true);
      setQuestion(questions[currentQuestionIndex]);
      const mediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorder);
      mediaRecorder.start();
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    mediaRecorder.stop();
    setIsFeedback(true); // Set feedback session aktif setelah rekaman berhenti
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value); // Menyimpan nilai feedback
  };

  const handleSubmitFeedback = () => {
    // Simpan feedback atau lakukan tindakan lain yang diperlukan
    console.log('Feedback for question ${currentQuestionIndex + 1}: ${feedback}');
    setFeedback(""); // Reset feedback
    setIsFeedback(false); // Selesai feedback session
    goToNextQuestion(); // Lanjut ke pertanyaan berikutnya
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < questions.length) {
        setQuestion(questions[nextIndex]);
        return nextIndex;
      } else {
        alert("Interview selesai");
        return prevIndex;
      }
    });
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-b from-sky-100 to-white h-full">
      <div className="container mx-auto p-4 pt-12">
        <h1 className="text-3xl font-bold mb-8">INTERVIEW TEST</h1>
        <div className="flex justify-center items-center mb-4 gap-56">
          <Button color="light" pill>
            <i className="ri-arrow-left-line me-1"></i> Back
          </Button>
          <h2 className="font-semibold">
            Question {currentQuestionIndex + 1}/{questions.length}
          </h2>
          <Button color="light" pill>
            End & Review
          </Button>
        </div>
        <div className="bg-white shadow-md p-8 rounded-lg max-w-3xl mx-auto text-center">
          <img src={mic} alt="Mic" className="w-40 rounded-lg mb-4 mx-auto" />
          <p className="text-xl font-bold mb-8">{question}</p>
          <p className="text-xl font-bold mb-8">
            <span className="bg-red-500 text-white rounded-lg p-3">
              {formatTime(timeLeft)}
            </span>
          </p>
          <div className="flex justify-center">
            {isRecording ? (
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-full"
                onClick={handleStopRecording}
              >
                Stop Recording
              </button>
            ) : isFeedback ? (
              <div className="w-full">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full"
                  onClick={handleSubmitFeedback}
                >
                  Next Question
                </button>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded mt-3 mb-4"
                  rows="4"
                  value={feedback}
                  onChange={handleFeedbackChange}
                  placeholder="NANTI feedback ada di sini"
                />
              </div>
            ) : (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full"
                onClick={handleStartRecording}
              >
                Start Recording
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Interview;