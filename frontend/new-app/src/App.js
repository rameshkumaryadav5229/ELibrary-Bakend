import React, { useState, useEffect } from "react";
import AuthForm from "./components/AuthForm";
import BooksManager from "./components/BooksManager";
export default function App() {
  const [role, setRole] = useState(null);

  // Refresh पर role restore
  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleLoginSuccess = (userRole) => {
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    setRole(null);
  };

  return (
    <div>
      {!role ? (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <BooksManager role={role} onLogout={handleLogout} />
      )}
    </div>
  );
}
