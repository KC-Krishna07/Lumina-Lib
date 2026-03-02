import React, { useState, useEffect } from "react";

const Profile = ({ user, setUser }) => {
  const [formData, setFormData] = useState({ displayName: user?.displayName || "", profilePic: user?.profilePic || "" });
  const [passwordData, setPasswordData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ displayName: user.displayName || "", profilePic: user.profilePic || "" });
    }
  }, [user]);

  const activeUserId = user?.id || user?._id;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId, ...formData }),
      });
      const data = await res.json();
      if (res.ok) {
        const newUser = { ...user, ...data };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        setStatus("Profile updated! ✨");
      }
    } catch (err) { setStatus("Error connecting to server."); }
    finally { setIsUpdating(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setStatus("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/profile/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId, oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Success: " + (result.msg || "Password Updated!"));
        setStatus("Password updated successfully! 🔐");
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert("Error: " + (result.error || "Failed to update"));
        setStatus("Error: " + (result.error || "Update failed"));
      }
    } catch (err) {
      alert("Critical Error: Backend is not responding.");
      setStatus("Error: Could not connect to server.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <img src={formData.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.username}`} alt="Avatar" style={avatarStyle} />
        <h2 style={{ color: "#00e5ff" }}>@{user?.username}</h2>
        
        {status && <div style={{ padding: "10px", margin: "10px 0", borderRadius: "5px", background: "#222", color: "#00e5ff", border: "1px solid #00e5ff" }}>{status}</div>}
        
        <form onSubmit={handleUpdate} style={formStyle}>
          <input type="text" placeholder="Display Name" value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} style={inputStyle} />
          <input type="text" placeholder="Profile Pic URL" value={formData.profilePic} onChange={(e) => setFormData({...formData, profilePic: e.target.value})} style={inputStyle} />
          <button type="submit" disabled={isUpdating} style={buttonStyle}>Save Profile</button>
        </form>

        <hr style={{ margin: "20px 0", border: "0.5px solid #333" }} />

        <form onSubmit={handlePasswordChange} style={formStyle}>
          <h3 style={{ color: "white" }}>Security</h3>
          <input type="password" placeholder="Current Password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} style={inputStyle} required />
          <input type="password" placeholder="New Password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} style={inputStyle} required />
          <input type="password" placeholder="Confirm Password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} style={inputStyle} required />
          <button type="submit" disabled={isUpdating} style={{ ...buttonStyle, background: "none", border: "1px solid #00e5ff", color: "#00e5ff" }}>Update Password</button>
        </form>
      </div>
    </div>
  );
};

const containerStyle = { display: "flex", justifyContent: "center", padding: "50px" };
const cardStyle = { background: "#111", padding: "30px", borderRadius: "15px", width: "350px", textAlign: "center", border: "1px solid #333" };
const avatarStyle = { width: "100px", height: "100px", borderRadius: "50%", border: "2px solid #00e5ff" };
const formStyle = { display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" };
const inputStyle = { padding: "10px", background: "#1a1a1a", border: "1px solid #333", color: "white", borderRadius: "5px" };
const buttonStyle = { padding: "10px", background: "#00e5ff", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" };

export default Profile;