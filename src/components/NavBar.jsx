import React, { useState } from "react";

function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="z-50">
      <div className="relative">
        <div className="flex justify-between items-center w-full py-3 px-3">
          <h3 className="text-yellowsm text-2xl md:text-4xl md:ml-5">
            <a href="/"><span className="font-redacted font-bold">S </span><span className="font-quicksand font-semibold">salemate</span></a>
          </h3>
          
          {/* Desktop Navigation */}
          <ul className="hidden lg:flex text-black font-heading text-lg font-lato space-x-6 font-semibold">
            <li><a href="/contact" className="nav-link py-3 px-5 rounded-3xl text-yellowsm transition ease-in-out hover:bg-yellowsm hover:text-white border-2 border-yellowsm">Contact Us</a></li>
            <li><a href="#" className="nav-link py-3 px-5 rounded-3xl transition ease-in-out bg-yellowsm text-whitesm hover:bg-white hover:text-yellowsm hover:border-2 border-yellowsm">Get Access</a></li>
          </ul>
          
          {/* Mobile Toggle Button */}
          <div className="lg:hidden md:flex flex-col">
            <button 
              id="nav-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="menu-icon text-4xl">☰</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <ul 
          id="mobile-menu" 
          className={`${isMobileMenuOpen ? 'block' : 'hidden'} absolute inset-x-0 top-12 bg-primary py-5 px-7 text-center font-lato text-lg`}
        >
          <li><a href="#" className="block my-3 transition ease-in-out hover:bg-background hover:text-primary rounded-full">Contact Us</a></li>
          <li><a href="#" className="block my-3 transition ease-in-out hover:bg-background hover:text-primary rounded-full">Get Access</a></li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;