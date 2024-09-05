import { useNavigate } from "react-router-dom";

const FeaturesLanding = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/dashboard");
  };

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Step 1 - Generate questions</h2>
          <ul className="list-disc list-inside text-left mx-auto max-w-lg mt-4">
            <li>Behavioral and technical questions</li>
            <li>Works for all job descriptions and industries</li>
          </ul>
        </div>
        <div className="flex justify-center">
          <div className="bg-white shadow-md rounded-lg p-6 max-w-lg w-full">
            <div className="flex flex-wrap justify-center mb-4">
              <button className="bg-gray-200 rounded-full px-4 py-2 m-1">
                Marketing Specialist
              </button>
              <button className="bg-gray-200 rounded-full px-4 py-2 m-1">
                Customer Service Representative
              </button>
              <button className="bg-gray-200 rounded-full px-4 py-2 m-1">
                Sales Representative
              </button>
              <button className="bg-gray-200 rounded-full px-4 py-2 m-1">
                Human Resources Specialist
              </button>
              <button className="bg-gray-200 rounded-full px-4 py-2 m-1">
                Data Analyst
              </button>
              <button className="bg-gray-200 rounded-full px-4 py-2 m-1">
                UX/UI Designer
              </button>
              <button className="bg-gray-200 rounded-full px-4 py-2 m-1">
                QA Engineer
              </button>
            </div>
            <div className="border p-4 mb-4">
              <h3 className="font-semibold">Job Title: Software Engineer</h3>
              <p className="text-sm text-gray-600 mt-2">
                Role Summary: We are looking for a Software Engineer to join our
                diverse and dedicated team. This position is an excellent
                opportunity for those seeking to grow their skills and
                experience in software development while working on projects
                with significant impact.
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
                <li>Develop and implement new software solutions.</li>
                <li>
                  Collaborate with teams to understand objectives, design
                  features, and meet specific requirements.
                </li>
                <li>
                  Improve and maintain existing software to ensure strong
                  functionality and optimization.
                </li>
                <li>
                  Recommend changes to existing software applications, as
                  necessary, to ensure excellent functionality.
                </li>
                <li>
                  Write efficient, secure, well-documented, and clean JavaScript
                  code.
                </li>
                <li>Participate in all phases of the development life cycle</li>
              </ul>
            </div>
            <button className="bg-blue-500 text-white rounded-full px-6 py-2">
              Generate Questions
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesLanding;
