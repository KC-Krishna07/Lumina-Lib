import React from 'react';
import './styles.css';

/**
 * Navbar1 Component
 * Serves as the primary brand identity header. 
 * Utilizes a centered flexbox layout to establish the visual anchor for the application.
 */
const Navbar1 = () => {
  return (
    <nav className='navbar1_container'>
      <div className="navbar1_content">
        {/* Primary Application Branding */}
        <h1 className='main_logo_text'>LuminaLib</h1>
      </div>
    </nav>
  );
}

export default Navbar1;