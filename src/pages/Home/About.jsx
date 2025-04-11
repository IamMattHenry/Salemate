import React from "react";
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";

const About = () => {
  return (
    <div>
      <div className="heading-quote min-w-auto md:w-10/12 flex mx-auto md:flex-row my-10 justify-between p-7">
        <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] flex-start mt-10">
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
        <div className="w-[40%]">
          <img alt="" src="/about-0.png"></img>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <HomeRoutes />
        <HomePanel> 
        <div className="max-w-[1440px] mx-auto md:px-15 h-[4330px] bg-white border border-gray-100 rounded-3xl shadow-lg dark:bg-white-800 dark:border-white-700">
            <h2 className="text-900 text-5xl pt-15 dark:text-white font-bold font-league spartan text-center">Our Story</h2>
            <p className="p-7 font-lato text-2xl tracking-tight text-center">At Salemate, we don’t just build sales tools we create  solutions that empower businesses to thrive. Born from the frustration of clunky, outdated systems. Salemate was designed to turn sales chaos into clarity, one smart feature at a time.</p>
            <hr className="h-0.5 my-7 w-200 mx-auto bg-gray-400 border-0 rounded-lg dark:bg-gray-400"></hr> 

            <div className="">
              <img className="h-[350px] max-w-full" src="/about-1.jpg" alt="team"/>
            </div>

              <div className="flex mt-10">
                 <h2 className="text-5xl font-bold font-league spartan text-center dark:text-white pt-10 mt-10 ml-10 -mr-60">How did Salemate come to be?
                 </h2>

                <div className="px- flex flex-col tracking-tight font-lato pt-8">
                  <p className=" text-2xl text-[25px] font-lato text-center dark:text-gray-300 ml-80 mr-5">It all started in our classrooms. Watching fellow entrepreneurship students struggle with clunky spreadsheets, lost sales data, and  late-night formula errors, we asked: "Why does sales tracking have to be this hard?"
                  <br></br>
                  <br></br>
                  “After months of testing and feedback, we created Salemate – a simple way to replace spreadsheet headaches. No lost leads, no formula fails. Just more time to grow your business."
                  </p>
                  <div className="">
                  <hr className="h-0.5 my-7 w-200 mx-auto bg-gray-400 border-0 rounded-lg dark:bg-gray-400 ml-17"></hr> 
                  </div>
                </div>
             </div>

             <div className="flex mt-10">
              <img className="w-[750px] h-[400px] ml-5" src="/about-2.jpg" alt="team"/>

              <div className="mt-10">  
              <h2 className="text-5xl font-bold font-league spartan text-center dark:text-white ml-15">
                  Prioritizing the entrepreneurship students of QCU
              </h2>
              <p className="text-2xl text-[25px] pt-5 font-lato text-center dark:text-gray-300 ml-5 -mr-10">We understood various challenges faced by these students, that’s why Salemate has to come to the game and making sure that all transactions are smoothly running and efficient during their operation hours. </p>
              </div>
            </div>

            <div className="mt-10">
            <hr className="h-0.5 my-7 w-200 mx-auto bg-gray-400 border-0 rounded-lg dark:bg-gray-400 ml-35 mt-20"></hr> 
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="text-5xl font-bold font-league spartan text-center dark:text-white">The team behind &nbsp;&nbsp;<span className="text-[#ffcf50] text-[60px] font-redacted font-bold">S</span> <span className="text-[#ffcf50] font-quicksand font-semibold">salemate</span></h2>
              <p className="text-center justify-center text-2xl text-[25px] pt-5 font-lato text-center dark:text-gray-300">Driven by Passion, United by Purpose.</p>
            </div>

            <div className="flex gap-15">
                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px]" src="/Matt.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Matt Henry Buenaventura</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">System Developer</h2>
                </div>

                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Ian.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Ian Angelo Valmores</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">System Developer</h2>
                </div>

                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Frivs.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Adrian Frivaldo</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">System Developer</h2>
                </div>
            </div>

            <div className="flex gap-15">
                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px]" src="/Jr.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Ricky Galanza Jr.</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">System Developer</h2>
                </div>

                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Juan.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Juan Carlo Dela Cruz</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">System Developer</h2>
                </div>

                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Dave.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Christian Dave Juliales</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">System Developer</h2>
                </div>
            </div>

            <div className="flex gap-15">
                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Charles.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Charles Kirby A. Valencia</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">UI Designer</h2>
                </div>

                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Errol.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">John Errol Sebial</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">UI Designer</h2>
                </div>

                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Kat.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Kath Serzo</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">UI Designer</h2>
                </div>
            </div>

            <div className="flex gap-15">
                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Diane.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Diane Rotono</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">Researcher</h2>
                </div>

                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Vhon.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Vhon Nicole Gonzaga</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">Researcher</h2>
                </div>

                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Seth.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Seth Exequiel Balido</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">Researcher</h2>
                </div>
            </div>

            <div className="flex flex justify-center items-center gap-15">
                <div className="mt-15 relative bg-[#ffcf50] w-[330px] h-110 shadow-[4px_4px_10px_rgba(0,0,0,0.3)]">
                  <img className="w-[330px] h-[320px] object-cover" src="/Kring.jpg" alt="members"/>
                  <h2 className="justify-center mt-5 text-center text-xl font-lato font-bold">Krhyss Kringle Tuba-on</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">Project Manager</h2>
                  <h2 className="justify-center mt-2 text-center text-xl font-lato">UI Designer</h2>
                </div>
            </div>

          </div>

        </HomePanel>
      
      </div>
        <div>

        </div>
    </div>



  );
};

export default About;
