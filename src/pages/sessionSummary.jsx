import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Accordion, Button } from "flowbite-react";
import axios from "axios";
import StarRating from "../components/starRating";

const SessionSummary = () => {
  const { uniqueId } = useParams();
  const [summaryData, setSummaryData] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/get_user_id', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data.user_id;
      } catch (error) {
        console.error('Error fetching user ID:', error);
        setError('Failed to load user ID.');
        return null;
      }
    };

    const fetchSummaryData = async () => {
      const userId = await fetchUserId();
      if (userId) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:5000/get_summary/${userId}/${uniqueId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log("Fetched summary data:", response.data);
          setSummaryData(response.data.summaries || []);
        } catch (error) {
          console.error('Error fetching summary data:', error.message || error);
          setError('Failed to load summary data.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSummaryData();
  }, [uniqueId]);

  useEffect(() => {
    if (summaryData.length > 0) {
      // Check the data structure and calculate the average rating
      const ratings = summaryData.map(item => item.rating).filter(rating => typeof rating === 'number');
      if (ratings.length > 0) {
        const totalRating = ratings.reduce((acc, rating) => acc + rating, 0);
        const averageRating = totalRating / ratings.length;
        setTotalScore(Math.round(averageRating));
      } else {
        setTotalScore(0);
      }
    }
  }, [summaryData]);

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
          <div className="">
            <Button onClick={handleEndReview} color="failure" pill>
              End Review
            </Button>
          </div>
        </div>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <>
            {error && <div className="text-center text-red-500 mb-4">{error}</div>}
            <div className="my-6 text-center">
              <h3 className="text-2xl font-bold">Total Score</h3>
              <StarRating rating={totalScore} />
            </div>
            <Accordion>
              {summaryData.length > 0 ? (
                summaryData.map((item, index) => (
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
                ))
              ) : (
                <div className="text-center">No summary data available.</div>
              )}
            </Accordion>
          </>
        )}
      </div>
    </div>
  );
};

export default SessionSummary;
