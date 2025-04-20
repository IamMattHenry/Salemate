import React from 'react'
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";
import { CircleAlert, CircleUser, Database, HandCoins, MonitorCog } from 'lucide-react';

const TermsAndCond = () => {
  return (
    <div><div className="min-w-auto md:w-10/12 flex mx-auto md:flex-row justify-between items-center -mb-10">
            <div className="flex flex-col lg:flex-col w-[50%]">
              <h1 className="font-lato font-semibold text-7xl -mt-10 -ml-4">
                Terms and Condition
                <br />
              </h1>
              <span className="mt-6 font-lato tracking-tigh text-[25px] -ml-5 leading-8 -mr-30">
              These terms outline the rules for using Salemate's platform designed to keep things fair, transparent, and safe for everyone. By accessing our services, you agree to these guidelines.
              Please read this carefully. If you have questions, contact us at <a href="#" className="underline"> sampleadmin@gmail.com.</a>
              </span>
              <br />
            </div>
            <div className="flex pl-40 -mr-7">
              <img alt="about-image" className="w-170 -mt-10" src='/terms-0.png'></img>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <HomeRoutes />
            <HomePanel>
  <div className="w-full max-w-[1600px] mx-auto h-180 md:px-24 py-14 bg-white border border-gray-100 rounded-3xl shadow-lg dark:bg-white-800 dark:border-white-700">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      
       {/* 1. Account and Responsibility */}
       <div className="flex gap-5 items-start pt-15 ml-10">
        <img src='/terms-one.jpg' alt='one' className="w-30 h-30 text-black-600 flex-shrink-0" />
        <div className="-mt-3 ml-5">
          <h2 className="text-2xl font-semibold font-lato text-black mb-5 -ml-3">1. Account Responsibility</h2>
              <div className='flex flex-col'>
              <hr className="h-0.5 -ml-4 w-80 mx-auto bg-black opacity-25 border-0 rounded-lg"></hr>
              </div>
          <ul className="list-disc marker:text-2xl tracking-tight pl-5 -ml-5 pt-2 text-[18px] text-justify font-lato -mr-5">
            <li>You must provide accurate info when signing up.</li>
            <li>Keep your login details secure you’re responsible for all activity under your account.</li>
          </ul>
        </div>
      </div>

        {/* 2. Use of the Platform */}
        <div className="flex gap-10 items-start pt-15">
        <img src='/terms-two.jpg' className="w-30 h-30 text-black-600 flex-shrink-0" />
        <div className="-mt-3 ml-5">
          <h2 className="text-2xl font-semibold font-lato text-black mb-5 -ml-7">2. Use of the Platform</h2>
          <div className='flex flex-col'>
          <hr className="h-0.5 -ml-7 mt-1 w-83 mx-auto bg-black opacity-25 border-0 rounded-lg"></hr>
          </div>
          <ul className="list-disc marker:text-2xl pl-5 pt-2 -ml-8 text-[18px] text-justify font-lato mr-5">
          <li>Salemate is for legitimate business use only.</li>
          <li>Don’t misuse the platform (e.g., spam, illegal activities, or harming the system).</li>
          </ul>
        </div>
      </div>

      {/* 3. Payment Handling */}
      <div className="flex gap-10 items-start ml-10">
        <img src='/terms-three.jpg' className="w-30 h-30 text-black-600 flex-shrink-0" />
        <div className="-mt-3 ml-5">
          <h2 className="text-2xl font-semibold font-lato text-black mb-5 -ml-7">3. Payment Handling</h2>
          <div className='flex flex-col'>
          <hr className="h-0.5 -ml-7 w-80 mx-auto bg-black opacity-25 border-0 rounded-lg"></hr>
          </div>
          <ul className="list-disc marker:text-2xl tracking-tight pl-5 -ml-8 pt-2 text-[18px] text-justify font-lato -mr-10">
            <li>All payments require manual verification.</li>
            <li>System doesn't process payments automatically.</li>
            <li>You're responsible for payment disputes.</li>
          </ul>
        </div>
      </div>

        {/* 4. System Limitations */}
        <div className="flex gap-10 items-start">
        <img src='/terms-four.jpg' className="w-30 h-30 text-black-600 flex-shrink-0" />
        <div className="-mt-3 ml-5">
          <h2 className="text-2xl font-semibold font-lato text-black mb-2 -ml-7">4. System Limitations</h2>
          <div className='flex flex-col'>
          <hr className="h-0.5 -ml-7 mt-1 w-83 mx-auto bg-black opacity-25 border-0 rounded-lg"></hr>
          </div>
          <ul className="list-disc marker:text-2xl pt-2 pl-5 -ml-8 text-[18px] text-justify font-lato ">
            <li>No barcode scanner integration.</li>
            <li>Mobile-responsive but no dedicated app.</li>
          </ul>
        </div>
      </div>
    </div>

     {/* 5. Data Rules */}
     <div className="flex gap-10 items-start mt-10 ml-10">
      <img src='/terms-five.jpg' className="w-30 h-30 text-black-600 flex-shrink-0" />
      <div className="pt-2 ml-5">
        <h2 className="text-2xl font-semibold font-lato text-black mb-5 -ml-7">5. Data Rules</h2>
        <div className='flex flex-col'>
        <hr className="h-0.5 -ml-7 w-80 mx-auto bg-black opacity-25 border-0 rounded-lg"></hr>
        </div>
        <ul className="list-disc marker:text-2xl pl-5 -ml-8 pt-2 text-[18px] text-justify font-lato  -mr-10">
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