import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../assets/assets';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  
  const { token, setToken, userData } = useContext(AppContext)

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const logout = () => {
    setToken(false);
    localStorage.removeItem('token');
    navigate('/login');
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className='flex items-center justify-between text-sm py-4 px-5 md:px-10 border-b border-b-gray-400'>
      {/* Logo */}
      {/* <img onClick={() => navigate('/')} className='w-36 md:w-44 cursor-pointer' src={assets.logo} alt="logo" /> */}
      <p className='text-2xl font-medium cursor-pointer flex items-center gap-1' onClick={() => navigate('/')}>
        <span className='material-symbols-outlined text-blue-500'>radio_button_checked</span>
        Doc<span className='text-blue-500 font-medium text-2xl'>Spot!</span>
      </p>

      {/* Desktop Menu */}
      <ul className='hidden md:flex items-center gap-6 font-medium text-gray-700'>
        <NavLink to='/' className={({ isActive }) => isActive ? "text-blue-500" : "hover:text-gray-900"}>
          HOME
        </NavLink>
        <NavLink to='/doctors' className={({ isActive }) => isActive ? "text-blue-500" : "hover:text-gray-900"}>
          ALL DOCTORS
        </NavLink>
        <NavLink to='/about' className={({ isActive }) => isActive ? "text-blue-500" : "hover:text-gray-900"}>
          ABOUT
        </NavLink>
        <NavLink to='/contact' className={({ isActive }) => isActive ? "text-blue-500" : "hover:text-gray-900"}>
          CONTACT
        </NavLink>
      </ul>

      {/* Right side buttons */}
      <div className='flex items-center gap-4'>
        {/* Admin Panel Button - Always visible */}
        <button 
          onClick={() => window.location.href = 'https://docspots-admins.vercel.app/'}
          className='hidden md:block bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors'
        >
          Admin Panel
        </button>
        
        {/* User Profile or Login Button */}
        {token ? (
          <div className='relative profile-container'>
            <div 
              className='flex items-center gap-2 cursor-pointer' 
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              <img 
                className='w-9 h-9 rounded-full border object-cover' 
                src={userData?.image || assets.profile_pic} 
                alt="profile_pic"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = assets.profile_pic;
                }}
              />
              <img className='w-3' src={assets.dropdown_icon} alt="dropdown_icon" />
            </div>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div 
                className='absolute top-full right-0 mt-2 w-48 bg-white border shadow-lg rounded-lg p-3 z-50'
                onClick={(e) => e.stopPropagation()}
              >
                <p 
                  onClick={() => navigate('/my-profile')} 
                  className='py-2 px-3 hover:bg-gray-100 rounded cursor-pointer'>
                  My Profile
                </p>
                <p 
                  onClick={() => navigate('/my-appointments')} 
                  className='py-2 px-3 hover:bg-gray-100 rounded cursor-pointer'>
                  My Appointments
                </p>
                <p 
                  onClick={logout} 
                  className='py-2 px-3 hover:bg-gray-100 rounded cursor-pointer text-red-500'>
                  Logout
                </p>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')} 
            className='hidden md:block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700'>
            Create Account
          </button>
        )}
        
        {/* Mobile Menu Icon */}
        <img 
          onClick={() => setShowMenu(true)} 
          className='w-7 md:hidden cursor-pointer' 
          src={assets.menu_icon} 
          alt="menu_icon" 
        />
      </div>

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 w-[100%] sm:w-[50%] h-full bg-white shadow-lg transform ${showMenu ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 z-50`}>
        <div className='flex items-center justify-between px-5 py-6 border-b'>
          <p className='text-2xl font-medium flex items-center gap-1 cursor-pointer' onClick={() => navigate('/')}>
            <span className='material-symbols-outlined text-blue-500'>radio_button_checked</span>
            Doc<span className='text-blue-500 font-medium text-2xl'>Spot!</span>
          </p>
          <img className='w-6 cursor-pointer' onClick={() => setShowMenu(false)} src={assets.cross_icon} alt="close_icon" />
        </div>

        <ul className='flex flex-col items-center gap-2 px-5 py-4 font-medium text-lg'>
          <NavLink to='/' className=' py-2 border-b hover:text-blue-500' onClick={() => setShowMenu(false)}><p>HOME</p></NavLink>
          <NavLink to='/doctors' className=' py-2 border-b hover:text-blue-500' onClick={() => setShowMenu(false)}><p>ALL DOCTORS</p></NavLink>
          <NavLink to='/about' className=' py-2 border-b hover:text-blue-500' onClick={() => setShowMenu(false)}><p>ABOUT</p></NavLink>
          <NavLink to='/contact' className=' py-2 border-b hover:text-blue-500' onClick={() => setShowMenu(false)}><p>CONTACT</p></NavLink>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
