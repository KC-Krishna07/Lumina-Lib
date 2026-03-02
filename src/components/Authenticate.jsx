import React, { useState } from "react";
import "../App.css";

const Authenticate = ({ isOpen, onClose, setUser, setSavedBooks, setLikedBooks }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // --- LOAD USER'S LIBRARY FROM DATABASE INTO REACT ---
        if (data.user.savedBooks) setSavedBooks(data.user.savedBooks);
        if (data.user.likedBooks) setLikedBooks(data.user.likedBooks);
        
        setUser(data.user); 
        onClose(); 
      } else {
        setError(data.msg || "Authentication failed");
      }
    } catch (err) {
      setError("Cannot connect to server. Check port 5000.");
    }
  };

  return (
    <div className="auth_overlay" style={overlayStyle}>
      <div className="auth_modal" style={modalStyle}>
        <button onClick={onClose} style={closeBtnStyle}>&times;</button>
        <h2 style={{ color: '#00e5ff', marginBottom: '20px' }}>{isLogin ? "Sign In" : "Sign Up"}</h2>
        {error && <p style={{ color: '#ff4d4d', fontSize: '14px' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {!isLogin && <input name="username" placeholder="Username" onChange={handleChange} required style={inputStyle} />}
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
          <button type="submit" className="login_btn_nav" style={{ marginTop: '10px', padding: '10px' }}>{isLogin ? "Log In" : "Create Account"}</button>
        </form>

        <p style={{ marginTop: '20px', cursor: 'pointer', fontSize: '14px' }} onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "New here? Sign Up" : "Have an account? Log In"}
        </p>
      </div>
    </div>
  );
};

const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalStyle = { background: '#141414', padding: '40px', borderRadius: '8px', width: '350px', position: 'relative', textAlign: 'center', border: '1px solid #333' };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #333', background: '#222', color: 'white' };
const closeBtnStyle = { position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' };

export default Authenticate;