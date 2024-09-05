import React, { useState, useEffect } from "react";
import mic from "../assets/image/mic.jpg";
import { Accordion, Button, Modal, Spinner } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import StarRating from "../components/starRating";

function Interview() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [stream, setStream] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFeedback, setIsFeedback] = useState(false); // (menampilkan feedback)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false); // menampilkan spinner
  const [recordedBlobs, setRecordedBlobs] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const { code } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const token = localStorage.getItem('token');
  //   save array questions, answers, feedback, rating, sample_answer as an array
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [sampleAnswers, setSampleAnswers] = useState([]);
  // save all as an index
  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState("");
  const [answer, setAnswer] = useState("");
  const [rating, setRating] = useState(0);
  const [sampleAnswer, setSampleAnswer] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.post("http://localhost:5000/questions", { code });
        console.log("Fetched questions:", response.data.questions);
        setQuestions(response.data.questions);
        setSampleAnswers(response.data.sample_ans);
        setCategory(response.data.category);
      } catch (error) {
        console.error("Error fetching questions:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status);
        } else {
          console.error("Error message:", error.message);
        }
      }
    };
    
   

    fetchQuestions();
  }, [code]);

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
      setTimeLeft(120);
      setQuestion(questions[currentQuestionIndex]);
      setSampleAnswer(sampleAnswers[currentQuestionIndex]);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      let recordedBlobs = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedBlobs.push(event.data);
        }
      };

      setMediaRecorder(mediaRecorder);
      setRecordedBlobs(recordedBlobs);
      mediaRecorder.start();
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsFeedback(true);
      setIsLoadingPreview(true);
      
      mediaRecorder.onstop = async () => {
        // Check if no audio was recorded
        if (recordedBlobs.length === 0) {
          alert("Please start talking. No audio was recorded.");
          setIsLoadingPreview(false);
          return; // Exit early to avoid further processing
        }
    
        const blob = new Blob(recordedBlobs, { type: "audio/webm" });
        const wavBlob = await convertWebmToWav(blob);
        const answer = await sendAudioToFlask(wavBlob);
        const feedbackResponse = await postFeedbackToAPI(question, answer);
  
        if (feedbackResponse) {
          setAnswers((prevAnswers) => {
            const newAnswers = [...prevAnswers];
            newAnswers[currentQuestionIndex] = answer;
            return newAnswers;
          });
  
          setFeedbacks((prevFeedbacks) => {
            const newFeedbacks = [...prevFeedbacks];
            newFeedbacks[currentQuestionIndex] = feedbackResponse.feedback;
            return newFeedbacks;
          });
  
          setRatings((prevRatings) => {
            const newRatings = [...prevRatings];
            newRatings[currentQuestionIndex] = feedbackResponse.rating;
            return newRatings;
          });
  
          setFeedback(feedbackResponse.feedback);
          setRating(feedbackResponse.rating);
          setIsLoadingPreview(false);
        } else {
          console.error("Failed to get feedback and rating.");
          setIsLoadingPreview(false);
        }
      };
    }
  };
  
  

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setIsFeedback(false); // Selesai feedback session
      goToNextQuestion(); // Lanjut ke pertanyaan berikutnya
    } else {
      handleFinishInterview();
    }
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex < questions.length) {
        setQuestion(questions[nextIndex].question);
        setSampleAnswer(sampleAnswers[nextIndex].sampleAnswer);
        setTimeLeft(120);
        setIsRecording(false);
        setAnswer("");
        setFeedback("");
        setRating(0);
        return nextIndex;
      } else {
        alert("Interview selesai");
        return prevIndex;
      }
    });
  };

  const handleFinishInterview = () => {
    handleOpenModal(
      "Apakah Anda yakin ingin mengakhiri sesi interview dan review summary dari feedback Anda? Anda tidak dapat melanjutkan sesi interview ini."
    );
  };

  const handleOpenModal = (message) => {
    setModalMessage(message);
    setOpenModal(true);
  };

  const handleModalConfirm = async () => {
    setOpenModal(false);
    if (modalMessage.includes("mengakhiri sesi interview")) {
      const uniqueId = uuidv4();
      const summaryData = {
        user_id: "exampleUserId", // Replace with actual user ID if available
        session_id: uniqueId,
        summaries: questions.map((question, index) => ({
          category,
          question: question,
          answer: answers[index],
          feedback: feedbacks[index],
          timestamp: new Date().toISOString(),
          rating: ratings[index],
          sample_ans: sampleAnswers[index],
        })),
      };
  
      const historyData = {
        session_id: uniqueId, // Include session_id in historyData
        category: category, // Replace with actual category
        grade: rating, // Replace with actual grade
        date: new Date().toISOString().split('T')[0], // Format date as 'YYYY-MM-DD'
      };
  
      try {
        // Save summary
        await axios.post("http://localhost:5000/summary", summaryData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        // Save history
        await axios.post("http://localhost:5000/save_history", historyData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        // Navigate to history after successful saving
        navigate('/history');
        console.log("Summary and history saved successfully:", { summaryData, historyData });
      } catch (error) {
        console.error("Error posting summary and history to API:", error);
        // Optionally show an error message to the user here
      }
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const convertWebmToWav = async (webmBlob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(webmBlob);

      reader.onloadend = () => {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        audioContext.decodeAudioData(reader.result, (buffer) => {
          const wavBlob = bufferToWav(buffer);
          resolve(wavBlob);
        });
      };

      reader.onerror = reject;
    });
  };

  const bufferToWav = (buffer) => {
    const numOfChannels = buffer.numberOfChannels;
    const length = buffer.length * numOfChannels * 2 + 44;
    const bufferData = new ArrayBuffer(length);
    const view = new DataView(bufferData);

    writeString(view, 0, "RIFF");
    view.setUint32(4, length - 8, true);
    writeString(view, 8, "WAVE");

    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 4, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);

    writeString(view, 36, "data");
    view.setUint32(40, length - 44, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channel = buffer.getChannelData(i);
      for (let j = 0; j < channel.length; j++) {
        view.setInt16(offset, channel[j] * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: "audio/wav" });
  };

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const sendAudioToFlask = async (blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "audio.wav");
    formData.append("question", question);

    try {
      const response = await axios.post(
        "http://localhost:5000/answer",
        formData,
        {
          headers: {
            question: question,
            audio: "multipart/form-data",
          },
        }
      );
      const answer = response.data.answer;
      setAnswer(answer);
      return answer;
      console.log("Server response:", answer);
    } catch (error) {
      console.error("Error sending audio to Flask:", error);
    }
  };

  const postFeedbackToAPI = async (question, answer) => {
    try {
      const response = await axios.post("http://localhost:5000/feedback", {
        question,
        answer,
      });
      console.log("Feedback posted to API:", response.data);
      const feedback = response.data.feedback;
      const rating = response.data.rating;
      return { feedback, rating };
    } catch (error) {
      console.error("Error posting feedback to API:", error);
    }
  };

  return (
    <div className="bg-gradient-to-b from-sky-100 to-white h-full">
      <div className="container mx-auto p-4 pt-12">
        <h1 className="text-3xl font-bold mb-8 text-center">{category}</h1>
        <div className="flex justify-center items-center mb-4 gap-56">
          <Button
            onClick={() =>
              handleOpenModal(
                "Apakah Anda yakin ingin keluar dari sesi latihan?"
              )
            }
            color="light"
            pill
          >
            <i className="ri-arrow-left-line me-1"></i> Back
          </Button>
          <h2 className="font-semibold">
            Question {currentQuestionIndex + 1}/{questions.length}
          </h2>
          <Button
            onClick={() =>
              handleOpenModal(
                "Apakah Anda yakin ingin mengakhiri sesi interview dan review summary dari feedback Anda? Anda tidak dapat melanjutkan sesi interview ini."
              )
            }
            color="failure"
            pill
          >
            End & Review
          </Button>
        </div>
        <div className="bg-white shadow-md p-8 rounded-lg max-w-3xl mx-auto text-center h-full">
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
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full mb-3"
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex + 1 === questions.length
                    ? "Finish Interview"
                    : "Next Question"}
                </button>
                <Accordion>
                  <Accordion.Panel>
                    <Accordion.Title>Your Answer</Accordion.Title>
                    <Accordion.Content>
                      {isLoadingPreview ? (
                        <div className="flex items-center justify-center">
                          <Spinner size="md" /> 
                          <span className="pl-3 text-gray-400">Please Wait...</span>
                        </div>
                      ) : (
                        <p className="mb-2 text-gray-500 dark:text-gray-400">
                          {answer}
                        </p>
                      )}
                    </Accordion.Content>
                  </Accordion.Panel>
                  <Accordion.Panel>
                    <Accordion.Title>Feedback</Accordion.Title>
                    <Accordion.Content>
                      {isLoadingPreview ? (
                        <div className="flex items-center justify-center">
                          <Spinner size="md" />
                          <span className="pl-3 text-gray-400">Please Wait...</span>
                        </div>
                      ) : (
                        <>
                          <div className="mb-2">
                            <StarRating rating={rating} />
                          </div>
                          <p className="mb-2 text-gray-500 dark:text-gray-400">
                            {feedback}
                          </p>
                        </>
                      )}
                    </Accordion.Content>
                  </Accordion.Panel>
                  <Accordion.Panel>
                    <Accordion.Title>Sample Answer</Accordion.Title>
                    <Accordion.Content>
                      {isLoadingPreview ? (
                        <div className="flex items-center justify-center">
                          <Spinner size="md" />
                          <span className="pl-3 text-gray-400">Please Wait...</span>
                        </div>
                      ) : (
                        <p className="mb-2 text-gray-500 dark:text-gray-400">
                          {sampleAnswer}
                        </p>
                      )}
                    </Accordion.Content>
                  </Accordion.Panel>
                </Accordion>
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
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {modalMessage}
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleModalConfirm} pill>
                Yes, I'm sure
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)} pill>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Interview;
