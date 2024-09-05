import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Accordion, Button } from "flowbite-react";
import axios from "axios";
import StarRating from "../components/starRating";

const Summary = () => {
  const { id } = useParams();
  const [summaryData, setSummaryData] = useState([]);
  const [rating, setRating] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const navigate = useNavigate();

  // Fetch summary data from the server
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/get_summary/${id}`);
        setSummaryData(response.data);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    fetchSummaryData();
  }, [id]);

  // Calculate the average rating
  useEffect(() => {
    if (summaryData.length > 0) {
      const totalRating = summaryData.reduce((acc, item) => acc + item.rating, 0);
      const averageRating = totalRating / summaryData.length;
      const roundedAverageRating = Math.round(averageRating);
      setTotalScore(roundedAverageRating);
    }
  }, [summaryData]);

  // Handle the end review button click
  const handleEndReview = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-customBiru4 py-10 px-10">
      <div className="bg-white rounded shadow p-12">
        <div className="grid grid-cols-6 justify-center">
          <h2 className="text-3xl text-center font-extrabold mb-6 col-start-2 col-span-4">
            Rating and Reviews
          </h2>
          <div className="col-start-2 col-span-4 text-center">
            <Button onClick={handleEndReview} color="failure" pill>
              End Review
            </Button>
          </div>
        </div>
        <div className="my-6 text-center">
          <h3 className="text-2xl font-bold">Total Score</h3>
          <StarRating rating={totalScore} />
        </div>
        <Accordion>
          {summaryData.map((item, index) => (
            <Accordion.Panel key={index}>
              <Accordion.Title>
                Q{index + 1}. {item.question}
              </Accordion.Title>
              <Accordion.Content>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                  Answer: {item.answer}
                </p>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                  Feedback: {item.feedback}
                </p>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                  Rating: {item.rating}
                </p>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                  Timestamp: {new Date(item.timestamp).toLocaleString()}
                </p>
                <p className="mb-2 text-gray-500 dark:text-gray-400">
                  Sample Answer: {item.sample_ans}
                </p>
              </Accordion.Content>
            </Accordion.Panel>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Summary;
