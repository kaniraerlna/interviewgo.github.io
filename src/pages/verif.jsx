import { useNavigate } from "react-router-dom";

const Verif = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  return (
    <div className="bg-gradient-to-b from-sky-100 to-white min-h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-2xl text-gray-600 mb-6 max-w-3xl mx-auto">
        Congratulations! You successfully regist
        </p>
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleGetStarted}
            className="mt-6 outline outline-offset-2 outline-4 outline-customBiru3 bg-gradient-to-r from-customBiru3 to-customBiru6 text-white py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:from-customBiru4 hover:to-customBiru3"
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Verif;