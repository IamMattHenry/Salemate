import React from "react";
import { HomePanel } from "../components/Home/HomePanel";
import { HomeRoutes } from "../components/Home/HomeRoutes";

const About = () => {
  return (
    <div>
      <div className="heading-quote min-w-auto md:w-10/12 flex mx-auto md:flex-row my-10 justify-between p-7">
        <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] flex-start">
          <h1 className="font-league spartan font-semibold text-7xl">
            About Us
            <br />
          </h1>
          <span className="mt-5 font-lato text-xl md:text-2x1 text-justify">
              We're proud to introduce Salemate <br></br>

              <br></br>Your web-based platform designed to simplify sales operations and make work life easier. Built for efficiency, our tools help you manage sales wisely, easily, and quickly.
          </span>
          <br />
        </div>
        <div className="border w-[40%]">
          <img alt="about-image"></img>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <HomeRoutes />
        <HomePanel> 
        <div className="max-w-[1440px] mx-auto md:px-20 h-[1000px] bg-white border border-gray-100 rounded-3xl shadow-lg dark:bg-white-800 dark:border-white-700">
            <h2 className="text-900 text-5xl pt-15 dark:text-white font-bold font-league spartan text-center">Our Story</h2>
            <p className="p-7 font-lato text-2xl tracking-tight text-center">At Salemate, we don’t just build sales tools we create  solutions that empower businesses to thrive. Born from the frustration of clunky, outdated systems. Salemate was designed to turn sales chaos into clarity, one smart feature at a time.</p>
            <hr className="h-px my-7 w-200 mx-auto bg-gray-500 border-0 rounded-lg dark:bg-gray-400"></hr> 

              <div className="flex mt-20">
                  <h2 className="text-4xl font-bold font-league spartan text-center dark:text-white mt-10 ml-">How did Salemate come to be?</h2>

                <div className="px- flex flex-col tracking-tight font-lato">
                  
                  <p className=" text-2xl text-justify font-lato text-left dark:text-gray-300 ml-10 mr-15">It all started in our classrooms. Watching fellow entrepreneurship students struggle with clunky spreadsheets, lost sales data, and  late-night formula errors, we asked: "Why does sales tracking have to be this hard?"
                  <br></br>
                  <br></br>
                  “After months of testing and feedback, we created Salemate – a simple way to replace spreadsheet headaches. No lost leads, no formula fails. Just more time to grow your business."</p>
                </div>
             </div>
          </div>
        </HomePanel>
      
      </div>
    </div>
  );
};

export default About;
