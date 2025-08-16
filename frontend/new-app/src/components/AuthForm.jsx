import React, { useState } from "react";
import axios from "axios";

export default function AuthForm({ onLoginSuccess }) {
  const [mode, setMode] = useState("userLogin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "signup") {
        await axios.post("http://localhost:4000/api/auth/signup", {
          name,
          email,
          password,
        });
        alert("Signup successful");
        setMode("userLogin");
      } else {
        const role = mode === "adminLogin" ? "admin" : "user";
        const { data } = await axios.post(
          "http://localhost:4000/api/auth/login",
          {
            email,
            password,
            role,
          }
        );

        // LocalStorage में save करो
        localStorage.setItem("role", data.role);
        localStorage.setItem("userEmail", email);

        alert(`${role} login successful`);

        if (onLoginSuccess) {
          onLoginSuccess(data.role);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
    }
  };

  return (
    <div
      className="flex justify-center items-center min-h-screen 
                 bg-[url('https://images.unsplash.com/photo-1512820790803-83ca734da794')] 
                 bg-cover bg-center"
    >
      <div className="w-full max-w-md bg-white bg-opacity-90 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          {mode === "userLogin" && "User Login"}
          {mode === "adminLogin" && "Admin Login"}
          {mode === "signup" && "Signup"}
        </h1>


        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {mode === "signup" && (
            <din>
            Enter The Name<input
              type="text"
              placeholder="Enter The Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            />
            </din>
          )}





         Enter The Email <input
            type="email"
            placeholder="Enter The Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            required
          />
         Enter The Password <input
            type="password"
            placeholder=" Enter The Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition cursor-pointer"
          >
            {mode === "signup" ? "Signup" : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode !== "userLogin" && (
            <button
              onClick={() => setMode("userLogin")}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 cursor-pointer"
            >
              User Login
            </button>
          )}
          {mode !== "adminLogin" && (
            <button
              onClick={() => setMode("adminLogin")}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 cursor-pointer"
            >
              Admin Login
            </button>
          )}
          {mode !== "signup" && (
            <button
              onClick={() => setMode("signup")}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 cursor-pointer"
            >
              Signup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
