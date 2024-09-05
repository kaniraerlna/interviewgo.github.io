import React, { useState, useEffect } from "react";
import { FloatingLabel } from "flowbite-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const [preview, setPreview] = useState(null);
  const [src, setSrc] = useState(null);
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Missing token");
        }

        const response = await axios.get("http://localhost:5000/get_user_info", {
          headers: {
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
        });

        const { fullname, email, profile_pic_real } = response.data.user;
        setFullname(fullname);
        setEmail(email);

        if (profile_pic_real) {
          setSrc(`http://localhost:5000/uploads/${profile_pic_real}`);
        } else {
          setSrc('path/to/placeholder-image.png');
        }
      } catch (error) {
        handleFetchError(error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleFetchError = (error) => {
    if (error.response) {
      console.log(error.response.data);
      setError(`Error: ${error.response.data.msg}`);
    } else if (error.request) {
      console.log(error.request);
      setError("Error: No response received from server");
    } else {
      console.log("Error", error.message);
      setError(`Error: ${error.message}`);
    }
  };

  const handleEditProfile = () => {
    navigate("/editProfile");
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Missing token");
      }

      await axios.post("http://localhost:5000/delete_user", {}, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      handleFetchError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-customBiru3 text-white">
      <div className="w-1/2 p-8 rounded-lg shadow-lg bg-white">
        <div className="flex flex-row gap-8 p-3">
          {/* Image Profile */}
          <div className="image-profile content-center basis-1/2">
            <div className="flex items-center justify-center mb-6">
              {src ? (
                <img
                  src={src}
                  alt="Profile"
                  className="w-48 h-48 rounded-full outline outline-blue-500" // Increased size to 48x48
                  onError={(e) => {
                    e.target.src = 'path/to/placeholder-image.png';
                  }}
                />
              ) : (
                <div className="w-48 h-48 rounded-full flex items-center justify-center outline outline-blue-500">
                  <i className="ri-bear-smile-line text-blue-500 text-6xl"></i> {/* Adjusted icon size */}
                </div>
              )}
            </div>
          </div>

          {/* Display Profile Info */}
          <div className="flex flex-col w-full items-center space-y-4 ms-5 pe-5">
            <h1 className="text-secondaryBlack font-bold text-3xl">My Profile</h1>
            <div className="w-full">
              <div className="mt-8">
                <FloatingLabel
                  variant="outlined"
                  label="Fullname"
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={fullname}
                  disabled
                  className="rounded-none outline-black"
                />
              </div>
              <div className="mt-6">
                <FloatingLabel
                  variant="outlined"
                  label="Email"
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  disabled
                  className="rounded-none outline-black"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleEditProfile}
            className="flex justify-center font-medium text-sm bg-gradient-to-r from-customBiru3 to-customBiru6 text-white rounded-full shadow-lg hover:from-customBiru4 hover:to-customBiru3 px-5 py-2.5 me-2 mb-2"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
