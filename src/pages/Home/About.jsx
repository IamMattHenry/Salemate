import React from "react";
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";
import TeamPage from "./TeamMembers";

const About = () => {
  return (
    <div>
      <div className="heading-quote min-w-auto md:w-10/12 flex mx-15 md:flex-row my-15 justify-between items-center px-12">
        <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] flex-start">
          <h1 className="font-lato font-semibold md:text-[80px]">
            About Us
            <br />
          </h1>
          <span className="tracking-tight -mr-5 font-lato text-[22px] text-">
            We're proud to introduce Salemate <br></br>
            <br />
            Your web-based platform designed to simplify sales operations and
            make work life easier. Built for efficiency, our tools help you
            manage sales wisely, easily, and quickly.
          </span>
          <br />
        </div>
        <div className="w-[500px] flex -mr-50 -mt-10">
          <img alt="" src="/about-0.png"></img>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <HomeRoutes />
        <HomePanel>
          <div className="max-w-full mx-auto h-1130 bg-white border border-gray-100 rounded-3xl shadow-lg p-5 dark:border-white-700">
            <h2 className="text-5xl font-bold font-lato font-semibold text-center mt-20">
              Our Story
            </h2>
            <p className="mt-5 px-28 font-lato text-[25px] tracking-tight text-center">
              At Salemate, we don't just build sales tools we create solutions
              that empower businesses to thrive. Born from the frustration of
              clunky, outdated systems. Salemate was designed to turn sales
              chaos into clarity, one smart feature at a time.
            </p>
            <hr className="h-0.5 my-7 mt-10 w-230 mx-auto bg-black opacity-25 border-0 rounded-lg"></hr>

            <div className="flex items-center justify-center mt-9">
              <img
                className="h-[390px] w-[1230px]"
                src="/about-1.jpg"
                alt="team"
              />
            </div>

            <div className="flex mt-10">
              <h2 className="text-5xl font-semibold font-lato text-center pt-10 mt-10 ml-35 -mr-60">
                How did Salemate come to be?
              </h2>

              <div className="flex flex-col tracking-tight font-lato text-justify pt-8">
                <p className="tracking-tight text-2xl text-[25px] font-lato text-center ml-100 mr-15">
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
                  <hr className="h-0.5 my-7 mt-10 w-230 bg-black opacity-25 border-0 rounded-lg"></hr>
                </div>
              </div>
            </div>

            <div className="flex mt-10">
              <img
                className="w-690 h-110 ml-15 mt-10"
                src="/about-2.jpg"
                alt="team"
              />

              <div className="mt-25">
                <h2 className="text-5xl font-semibold font-lato text-center ml-5">
                  Prioritizing the entrepreneurship students of QCU
                </h2>
                <p className="tracking-tight text-2xl text-[25px] pt-5 font-lato text-center ml-13 mr-10">
                  We understood various challenges faced by these students,
                  that's why Salemate has to come to the game and making sure
                  that all transactions are smoothly running and efficient
                  during their operation hours.{" "}
                </p>
              </div>
            </div>

            <div className="mt-10">
              <hr className="h-0.5 my-7 w-230 bg-black opacity-25 border-0 rounded-lg ml-43 mt-25"></hr>
            </div>

            <div className="flex flex-col justify-center">
              <h2 className="text-5xl font-semibold font-lato text-center">
                The team behind &nbsp;&nbsp;
                <span className="text-[#ffcf50] text-[65px] font-redacted font-bold">
                  S
                </span>{" "}
                <span className="text-[#ffcf50] text-[45px] font-quicksand font-semibold">
                  salemate
                </span>
              </h2>
              <p className="text-center justify-center text-2xl text-[25px] pt-5 font-lato">
                Driven by Passion, United by Purpose.
              </p>
            </div>
            <TeamPage />
          </div>
        </HomePanel>
      </div>
    </div>
  );
};

export default About;
