import React, { useState, useEffect, useRef } from 'react';
import './styles.css'; 

const Navbar2 = ({ setCategory, onSearch, activeTab = "", user, onSignInClick, onLogout }) => {
  const [search, setSearch] = useState("");
  const [showGenres, setShowGenres] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  const navLinks = ["Home", "Popular", "Top Rated", "Saved", "Liked"];
  const genresList = ["Romance", "Sci-Fi", "Mystery", "Horror", "Fantasy", "History", "Thriller"];

  // Helper to safely compare tabs
  const isActive = (tabName) => {
    return activeTab?.toLowerCase() === tabName?.toLowerCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowGenres(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = (link) => {
    if(setCategory) setCategory(link.toLowerCase());
    setShowGenres(false); 
    setShowUserMenu(false);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault(); 
    if (search.trim() === "") return; 
    if(onSearch) onSearch(search); 
    setSearch(""); 
  };

  return (
    <nav className='navbar2_container'>
      <div className="navbar2_wrapper">
        <div className="nav_links_group">
          {navLinks.map((link) => (
            <div 
              key={link}
              className={`nav_lnk ${isActive(link) ? "active" : ""}`}
              onClick={() => handleLinkClick(link)}
            >
              {link}
            </div>
          ))}

          <div className="genre_dropdown_wrapper" ref={dropdownRef}>
            <span 
              className={`nav_lnk genre_trigger ${genresList.some(g => isActive(g)) ? "active" : ""} ${showGenres ? "open" : ""}`}
              onClick={() => setShowGenres(!showGenres)}
            >
              Genre <span className="arrow_icon" style={{ marginLeft: '5px' }}>{showGenres ? "▴" : "▾"}</span>
            </span>

            {showGenres && (
              <div className="dropdown_menu_box">
                {genresList.map((g) => (
                  <div 
                    key={g} 
                    className={`dropdown_item ${isActive(g) ? "active_genre" : ""}`}
                    onClick={() => handleLinkClick(g)}
                  >
                    {g}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <form className="search_container" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder='Search books...'
              className='search_input'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className='search_btn' style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 5px' }}>
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b5e5ed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          <div className="auth_nav_box">
            {user ? (
              <div className="user_profile_wrapper" ref={userMenuRef} style={{ position: 'relative' }}>
                <div 
                  onClick={() => setShowUserMenu(!showUserMenu)} 
                  className={`profile_trigger_box ${isActive("profile") ? "active" : ""}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    cursor: 'pointer',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: showUserMenu ? '1px solid #00e5ff' : '1px solid transparent',
                    transition: 'all 0.3s'
                  }}
                >
                  <img 
                    src={user.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} 
                    alt="avatar" 
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`;
                    }}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00e5ff' }} 
                  />
                  <span style={{ color: '#00e5ff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {user.displayName || (user.username ? user.username.split(' ')[0] : 'User')}
                  </span>
                  <span style={{ color: '#00e5ff', fontSize: '10px' }}>{showUserMenu ? "▴" : "▾"}</span>
                </div>

                {showUserMenu && (
                  <div className="dropdown_menu_box user_dropdown" style={{ right: 0, top: '45px', minWidth: '160px', position: 'absolute' }}>
                    <div className="dropdown_item" onClick={() => handleLinkClick("profile")}>
                      Profile Settings
                    </div>
                    <hr style={{ border: '0', borderTop: '1px solid #333', margin: '5px 0' }} />
                    <div className="dropdown_item logout_item" onClick={() => { onLogout(); setShowUserMenu(false); }} style={{ color: '#ff4d4d' }}>
                      Logout
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onSignInClick} className="login_btn_nav">Sign In</button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;