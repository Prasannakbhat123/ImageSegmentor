import React from 'react';
import IGlogo from '../assets/IGlogo.png';

const Navbar = () => {
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    const navbar = document.querySelector('nav');
    const navbarHeight = navbar ? navbar.offsetHeight : 0;

    if (sectionId === 'home') {
      // Force scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section) {
      const sectionPosition = section.offsetTop - navbarHeight;
      window.scrollTo({ top: sectionPosition, behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 z-50 flex items-center justify-between p-4 bg-white text-black shadow-md">
      <div className="flex items-center">
        <img src={IGlogo} alt="Logo" className="w-10 h-10 mr-2" />
        <span className="text-xl font-bold">ImageSegmentor</span>
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 space-x-4">
        <button onClick={() => scrollToSection('home')} className="hover:underline bg-transparent focus:outline-none border-none">
          Home
        </button>
        <button onClick={() => scrollToSection('try')} className="hover:underline bg-transparent focus:outline-none border-none">
          Try
        </button>
        <button onClick={() => scrollToSection('faq')} className="hover:underline bg-transparent focus:outline-none border-none">
          FAQ
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
