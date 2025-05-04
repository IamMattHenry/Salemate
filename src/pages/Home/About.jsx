import React from "react";
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";
import TeamPage from "./TeamMembers";

const About = () => {
  return (
    <div>
      <div className="min-w-auto md:w-10/12 flex mx-auto md:flex-row justify-between items-center px-12 min-h-10/12 mt-18 mb-30">
        <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] flex-start">
          <h1 className="font-lato font-semibold text-2xl md:text-6xl">
            About Us
            <br />
          </h1>
          <span className="mt-5 font-latrue text-[1.3rem] text-justify">
            We're proud to introduce Salemate <br></br>
            <br />
            Your web-based platform designed to simplify sales operations and
            make work life easier. Built for efficiency, our tools help you
            manage sales wisely, easily, and quickly.
          </span>
          <br />
        </div>
        <div className="w-[50%] flex justify-end">
          <img alt="" src="/about-0.png"></img>
        </div>
      </div>
      <div className="relative">
      <div className="flex flex-col items-center">
        <HomeRoutes className="-mt-15"/>
        <HomePanel>
          <div className="max-w-full mx-auto md:px-15 min-h-auto bg-white border border-gray-100 rounded-3xl shadow-lg px-5 py-15 dark:border-white-700">
            <h2 className="text-5xl font-bold font-lato text-center">
              Our Story
            </h2>
            <p className="mt-3 font-latrue text-xl tracking-tight text-center">
              At Salemate, we don't just build sales tools we create solutions
              that empower businesses to thrive. Born from the frustration of
              clunky, outdated systems. Salemate was designed to turn sales
              chaos into clarity, one smart feature at a time.
            </p>
            <hr className="h-0.5 my-7 w-200 mx-auto bg-gray-400 border-0 rounded-lg dark:bg-gray-400"></hr>

            <div className="flex items-center justify-center">
              <img
                className="h-[350px] max-w-full"
                src="/about-1.jpg"
                alt="team"
              />
            </div>

            <div className="flex mt-10">
              <h2 className="text-5xl font-bold font-lato text-center pt-10 mt-10 ml-10 -mr-60">
                How did Salemate come to be?
              </h2>

              <div className="px- flex flex-col tracking-tight font-lato pt-8">
                <p className=" text-xl text-[25px] font-latrue text-center ml-80 mr-5">
                  It all started in our classrooms. Watching fellow
                  entrepreneurship students struggle with clunky spreadsheets,
                  lost sales data, and late-night formula errors, we asked: "Why
                  does sales tracking have to be this hard?"
                  <br></br>
                  <br></br>
                  “After months of testing and feedback, we created Salemate – a
                  simple way to replace spreadsheet headaches. No lost leads, no
                  formula fails. Just more time to grow your business."
                </p>
                <div className="">
                  <hr className="h-0.5 my-7 w-200 mx-auto bg-gray-400 border-0 rounded-lg dark:bg-gray-400 ml-17"></hr>
                </div>
              </div>
            </div>

            <div className="flex mt-10">
              <img
                className="w-[750px] h-[400px] ml-5"
                src="/about-2.jpg"
                alt="team"
              />

              <div className="mt-10">
                <h2 className="text-5xl font-bold font-lato text-center ml-15">
                  Prioritizing the entrepreneurship students of QCU
                </h2>
                <p className="text-xl text-[25px] pt-5 font-latrue text-center ml-5 -mr-10">
                  We understood various challenges faced by these students,
                  that's why Salemate has to come to the game and making sure
                  that all transactions are smoothly running and efficient
                  during their operation hours.{" "}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <hr className="h-0.5 my-7 w-200 mx-auto bg-gray-400 border-0 rounded-lg dark:bg-gray-400 ml-35 mt-20"></hr>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="text-5xl font-bold font-latrue text-center">
                The team behind &nbsp;&nbsp;
                <span className="text-[#ffcf50] text-[60px] font-redacted font-bold">
                  S
                </span>{" "}
                <span className="text-[#ffcf50] font-quicksand font-semibold">
                  salemate
                </span>
              </h2>
              <p className="text-center justify-center text-xl text-[25px] pt-5 font-lato">
                Driven by Passion, United by Purpose.
              </p>
            </div>
            <TeamPage />
          </div>
        </HomePanel>
      </div>
      </div>
      
    </div>
  );
};

export default About;
