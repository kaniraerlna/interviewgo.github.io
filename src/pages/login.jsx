import { FloatingLabel, Checkbox, Label } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/image/logo.png";
import RegistBG from "../assets/image/regist-bg.jpg";

const Login = () => {
  const navigate = useNavigate();
  const handleSignUpButton = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center from-sky-100 to-white">
      <div className="from-sky-100 to-white p-10 rounded-lg shadow-2xl w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <img src={Logo} alt="InterviewGo Logo" className="h-20" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">InterviewGo!</h1>
        <h2 className="text-lg text-center mb-6">
          <span className="font-medium">Join TODAY</span> and Ace Every
          Interview
        </h2>
        <form className="space-y-4">
          <div>
            <div className="mt-6">
              <FloatingLabel
                variant="standard"
                label="Email"
                id="email"
                name="email"
                type="email"
                required
                className="focus:ring-customBiru2-500 focus:border-customBiru2-500"
              />
            </div>
            <div className="mt-6">
              <FloatingLabel
                variant="standard"
                label="Password"
                id="password"
                name="password"
                type="password"
                required
                className="focus:ring-customBiru2-500 focus:border-customBiru2-500"
              />
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <a
                href="#"
                className="text-sm text-cyan-700 hover:underline dark:text-cyan-500"
              >
                Lost Password?
              </a>
            </div>
          </div>
          <div>
            <button
              onClick={handleSignUpButton}
              className="mt-10 w-full flex justify-center bg-gradient-to-r from-customBiru3 to-customBiru6 text-white py-3 px-8 rounded-full shadow-lg transform transition-transform hover:scale-105 hover:from-customBiru4 hover:to-customBiru3"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
