import logo from "../assets/image/logo.png";
import { useNavigate } from "react-router-dom";
import demoDashboard from "../assets/video/demoDashboard.mp4";

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  return (
    <div className="pt-20 bg-gradient-to-b from-sky-100 to-white min-h-screen items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
      <div className="max-w-7xl mx-auto mt-10 p-4 sm:px-6 lg:px-8 text-center">
        <div className="justify-center">
          <h1 className="text-2xl font-bold text-customBiru3">How It Works</h1>
          <p>Give yourself an unfair advantage in interviews</p>
        </div>
        <div className="flex flex-row mt-8">
          <div className="flex-1 text-black text-xl font-semibold">
            <h1 className="">Step 1 - Generate questions</h1>
            <p></p>
          </div>
          <div className="flex-1">
            <video src={demoDashboard} alt="demo1" autoPlay loop muted />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
