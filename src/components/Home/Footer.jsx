import React from "react";

function Footer() {
  return (
    <div>
      <div className="w-full text-center">
        <div>
          <a href="/">
          <img className="flex w-[200px] justify-center items-center ml-140 pb-7 pt-20" src="/salemate.png" alt="logo"/>
          </a>
        </div>
        <hr className="h-0.5 my-5 w-310 mx-auto bg-gray-700 border-0 rounded-lg dark:bg-400 opacity-10"></hr>  
          <div className="flex text-[17px] font-league spartan font-extralight tex-center justify-center gap-43">
            <h2> 
              <a href="/contact">Contact Us</a>
            </h2>
            <h2>
              <a href="/privacypolicy">Privacy Policy</a>
            </h2>
            <h2>
              <a href="/about">About Us</a>
            </h2>
            <h2>
              <a href="/terms-and-condition">Terms and Conditions</a>
            </h2>
            <h2>
              <a href="/features">Features</a>
            </h2>
          </div>
        <hr className="h-0.5 my-5 w-310 mx-auto bg-gray-700 border-0 rounded-lg dark:bg-400 opacity-10"></hr>  
        <p className="mt-3 font-lato text-dark-500 opacity-[50%] text-sm pb-10 pt-5">Copyright &copy; 2025 Salemate. All Rights Reserved.</p>
      </div>
    </div>
  );
}

export default Footer;
