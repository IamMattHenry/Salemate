import React from 'react'
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";
import { CircleAlert, CircleUser, Database, HandCoins, MonitorCog } from 'lucide-react';

const TermsAndCond = () => {
  return (
    <div><div className="min-w-auto md:w-10/12 flex mx-auto md:flex-row my-12 justify-between items-center px-12">
            <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] flex-start">
              <h1 className="font-lato font-semibold text-7xl">
                Terms and Condition
                <br />
              </h1>
              <span className="mt-6 font-lato tracking-tight text-[23px] md:text-[23px] text-justify">
              These terms outline the rules for using Salemate's platform designed to keep things fair, transparent, and safe for everyone. By accessing our services, you agree to these guidelines.
              Please read this carefully. If you have questions, contact us at sampleadmin@gmail.com.
              </span>
              <br />
            </div>
            <div className="flex w-[50%] justify-end">
              <img alt="about-image" src='/terms-0.png'></img>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <HomeRoutes />
            <HomePanel>
  <div className="w-full max-w-[1600px] mx-auto md:px-24 py-14 bg-white border border-gray-100 rounded-3xl shadow-lg dark:bg-white-800 dark:border-white-700">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      
       {/* 1. Account and Responsibility */}
       <div className="flex gap-5 items-start pt-20 -ml-7">
        <CircleUser className="w-33 h-33 text-black-600 flex-shrink-0" />
        <div className="pt-2">
          <h2 className="text-2xl font-bold font-lato text-black mb-2 -mr-20">1. Account and Responsibility</h2>
              <div className='flex flex-col'>
              <hr className="h-0.5 -ml-2 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr>
              </div>
          <ul className="list-disc pl-5 -ml-3 pt-2 text-[18px] text-justify font-lato -mr-5">
            <li>You must provide accurate info when signing up.</li>
            <li>Keep your login details secure you’re responsible for all activity under your account.</li>
          </ul>
        </div>
      </div>

        {/* 2. Use of the Platform */}
        <div className="flex gap-10 items-start pt-20 -ml-2">
        <MonitorCog className="w-33 h-33 text-black-600 flex-shrink-0" />
        <div className="pt-2">
          <h2 className="text-2xl font-bold font-lato text-black mb-2 -ml-5">2. Use of the Platform</h2>
          <div className='flex flex-col'>
          <hr className="h-0.5 -ml-7 mt-1 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr>
          </div>
          <ul className="list-disc pl-5 pt-2 -ml-8 text-[18px] text-justify font-lato -mr-5">
          <li>Salemate is for legitimate business use only.</li>
          <li>Don’t misuse the platform (e.g., spam, illegal activities, or harming the system).</li>
          </ul>
        </div>
      </div>

      {/* 3. Payment Handling */}
      <div className="flex gap-10 items-start -ml-7">
        <HandCoins className="w-33 h-33 text-black-600 flex-shrink-0" />
        <div className="pt-2">
          <h2 className="text-2xl font-bold font-lato text-black mb-3 -ml-5">3. Payment Handling</h2>
          <div className='flex flex-col'>
          <hr className="h-0.5 -ml-7 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr>
          </div>
          <ul className="list-disc pl-5 -ml-8 pt-2 text-[18px] text-justify font-lato  -mr-5">
            <li>All payments require manual verification.</li>
            <li>System doesn't process payments automatically.</li>
            <li>You're responsible for payment disputes.</li>
          </ul>
        </div>
      </div>

        {/* 4. System Limitations */}
        <div className="flex gap-10 items-start">
        <CircleAlert className="w-33 h-33 text-black-600 flex-shrink-0" />
        <div className="pt-2">
          <h2 className="text-2xl font-bold font-lato text-black mb-2 -ml-5">4. System Limitations</h2>
          <div className='flex flex-col'>
          <hr className="h-0.5 -ml-7 mt-1 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr>
          </div>
          <ul className="list-disc pt-2 pl-5 -ml-8 text-[18px] text-justify font-lato ">
            <li>No barcode scanner integration.</li>
            <li>Mobile-responsive but no dedicated app.</li>
          </ul>
        </div>
      </div>
    </div>

     {/* 5. Data Rules */}
     <div className="flex gap-10 items-start mt-10 -ml-7">
      <Database className="w-33 h-33 text-black-600 flex-shrink-0" />
      <div className="pt-2">
        <h2 className="text-2xl font-bold font-lato text-black mb-3 -ml-5">5. Data Rules</h2>
        <div className='flex flex-col'>
        <hr className="h-0.5 -ml-7 w-90 mx-auto bg-gray-400 border-0 rounded-lg"></hr>
        </div>
        <ul className="list-disc pl-5 -ml-8 pt-2 text-[18px] text-justify font-lato  -mr-5">
          <li>Back up your business data regularly.</li>
          <li>Delete customer info after projects end.</li>
        </ul>
      </div>
    </div>
  </div>
</HomePanel>
            </div>
          </div>
  );
};

export default TermsAndCond