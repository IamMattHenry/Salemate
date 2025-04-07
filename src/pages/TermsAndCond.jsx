import React from 'react'
import { HomePanel } from "../components/Home/HomePanel";
import { HomeRoutes } from "../components/Home/HomeRoutes";
import { BanknoteArrowUp, CircleAlert, CircleUser, Database, HandCoins, MonitorCog } from 'lucide-react';

const TermsAndCond = () => {
  return (
    <div><div className="heading-quote min-w-auto md:w-10/12 flex mx-auto md:flex-row my-10 justify-between p-7">
            <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] flex-start">
              <h1 className="font-league spartan font-semibold text-7xl">
                Terms and Condition
                <br />
              </h1>
              <span className="mt-6 font-lato tracking-tight text-[23px] md:text-[23px] -mr-[100px] text-justify">
              These terms outline the rules for using Salemate’s platform designed to keep things fair, transparent, and safe for everyone. By accessing our services, you agree to these guidelines.
              Please read this carefully. If you have questions, contact us at sampleadmin@gmail.com.
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
             <div className="max-w-[1440px] mx-auto md:px-20 h-[1000px] bg-white border border-gray-100 rounded-3xl       shadow-lg dark:bg-white-800 dark:border-white-700">
              <div className="p-25 flex items-center gap-10 -ml-20">
                  <CircleUser className="w-35 h-35 text-black-600"/>
                  <h2 className="text-2xl -mt-25 dark:text-white font-bold font-lato -ml-5">1. Account and Responsibility</h2>
              </div>
              <hr className="h-0.5 -mt-47 ml-45 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr> 
                <ul className="list-disc mt-2 mr-110 ml-50 text-[20px] text-justify font-lato text-left dark:text-gray-300">
                  <li>You must provide accurate info when signing up.</li>
                  <li>Keep your login details secure you’re responsible for all activity under your account.</li>
                </ul>

                <div className="p-25 flex items-center gap-10 -ml-20 -mt-10">
                    <HandCoins className="w-35 h-35 text-black-600"/>
                    <h2 className="text-2xl -mt-25 dark:text-white font-bold font-lato -ml-5">3. Payment Handling</h2>
                </div>
                <hr className="h-0.5 -mt-47 ml-45 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr>
                  <ul className="list-disc mt-2 mr-110 ml-50 text-[20px] text-justify font-lato text-left dark:text-gray-300">
                    <li>All payments require manual verification.</li>
                    <li>System doesn't process payments automatically.</li>
                    <li>You're responsible for payment disputes.</li>
                  </ul>

                <div className="p-25 flex items-center gap-10 -ml-20 -mt-10">
                    <Database className="w-35 h-35 text-black-600"/>
                    <h2 className="text-2xl -mt-25 dark:text-white font-bold font-lato -ml-5">5. Data Rules</h2>
                </div>
                <hr className="h-0.5 -mt-47 ml-45 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr> 
                <ul className="list-disc mt-2 mr-110 ml-50 text-[20px] text-justify font-lato text-left dark:text-gray-300">
                  <li>Back up your business data regularly.</li>
                  <li>Delete customer info after projects end.</li>
                </ul>

                <div className='p-25 flex items-center gap-10 -ml-20 -mt-10'>
                  <MonitorCog className='w-35 h-35 text-black-600'/>
                  <h2 className='text-2xl -mt-25 dark:text-white font-bold font-lato -ml-5'>2. Use of the Platform</h2>
                </div>
                <hr className="h-0.5 -mt-47 ml-45 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr> 
                <ul className="list-disc mt-2 mr-110 ml-50 text-[20px] text-justify font-lato text-left dark:text-gray-300">
                  <li>Salemate is for legitimate business use only.</li>
                  <li>Don’t misuse the platform (e.g., spam, illegal activities, or harming the system).</li>
                </ul>

                <div className='p-25 flex items-center gap-10 -ml-20 -mt-10'>
                  <CircleAlert className='w-35 h-35 text-black-600'/>
                  <h2 className='text-2xl -mt-25 dark:text-white font-bold font-lato -ml-5'>4. System Limitations</h2>
                </div>
                <hr className="h-0.5 -mt-47 ml-45 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr> 
                <ul className="list-disc mt-2 mr-110 ml-50 text-[20px] text-justify font-lato text-left dark:text-gray-300">
                  <li>No barcode scanner integration.</li>
                  <li>Mobile-responsive but no dedicated app.</li>
                </ul>
              </div> 
            </HomePanel>
            </div>
          </div>
  );
};

export default TermsAndCond