import { useState } from "react";
import { useNavigate } from "react-router-dom";

import React from "react";

export default function AltamodaGateLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validUsers = [
    { username: "admin", password: "altomoda2025" },
    { username: "thecornerteam", password: "altomoda2025" },
    { username: "myntra", password: "altomoda2025" },
  ];

  const handleGateLogin = (e) => {
    e.preventDefault();

    const match = validUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (match) {
      localStorage.setItem("altamoda_gate_access", "granted");
      navigate("/");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap');
        @font-face {
          font-family: 'Didot';
          src: local('Didot'), local('Didot LT STD');
          font-weight: normal;
          font-style: normal;
        }
      `}</style>
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-3xl font-semibold mb-6" style={{ color: "#C5A253", fontFamily: 'Didot' }}>
          ALTOMODA
        </h1>
        <p className="text-sm text-gray-600 mb-6" style={{ fontFamily: 'Montserrat' }}>
          This site is currently under construction, it is available for limited users only
        </p>

        <form onSubmit={handleGateLogin} className="space-y-5">
          <div className="text-left">
            <label className="block text-gray-700 mb-1 font-medium">Username</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-600"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div className="text-left">
            <label className="block text-gray-700 mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-yellow-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white text-lg font-medium shadow-md transition-all duration-300"
            style={{ backgroundColor: "#C5A253" }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
