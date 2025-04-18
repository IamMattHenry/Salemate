import React from 'react' ; 
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
  <div className="w-full max-w-[1600px] mx-auto md:px-24 py-14 bg-white border border-gray-100 rounded-3xl shadow-lg dark:bg-white-800 dark:border-white-700">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
      
      {/* 1. Account and Responsibility */}
      <div className="flex gap-10 items-start">
        <CircleUser className="w-28 h-28 text-black-600 flex-shrink-0" />
        <div className="pt-2">
          <h2 className="text-3xl font-bold font-lato text-black mb-3">1. Account and Responsibility</h2>
          <ul className="list-disc pl-5 text-[20px] text-justify font-lato text-gray-700">
            <li>You must provide accurate info when signing up.</li>
            <li>Keep your login details secure; you’re responsible for all activity under your account.</li>
          </ul>
        </div>
      </div>

      {/* 2. Use of the Platform */}
      <div className="flex gap-10 items-start">
        <MonitorCog className="w-28 h-28 text-black-600 flex-shrink-0" />
        <div className="pt-2">
          <h2 className="text-3xl font-bold font-lato text-black mb-3">2. Use of the Platform</h2>
          <ul className="list-disc pl-5 text-[20px] text-justify font-lato text-gray-700">
            <li>Salemate is for legitimate business use only.</li>
            <li>Don’t misuse the platform (e.g., spam, illegal activities, or harming the system).</li>
          </ul>
        </div>
      </div>

      {/* 3. Payment Handling */}
      <div className="flex gap-10 items-start">
        <HandCoins className="w-28 h-28 text-black-600 flex-shrink-0" />
        <div className="pt-2">
          <h2 className="text-3xl font-bold font-lato text-black mb-3">3. Payment Handling</h2>
          <ul className="list-disc pl-5 text-[20px] text-justify font-lato text-gray-700">
            <li>All payments require manual verification.</li>
            <li>System doesn't process payments automatically.</li>
            <li>You're responsible for payment disputes.</li>
          </ul>
        </div>
      </div>

      {/* 4. System Limitations */}
      <div className="flex gap-10 items-start">
        <CircleAlert className="w-28 h-28 text-black-600 flex-shrink-0" />
        <div className="pt-2">
          <h2 className="text-3xl font-bold font-lato text-black mb-3">4. System Limitations</h2>
          <ul className="list-disc pl-5 text-[20px] text-justify font-lato text-gray-700">
            <li>No barcode scanner integration.</li>
            <li>Mobile-responsive but no dedicated app.</li>
          </ul>
        </div>
      </div>
    </div>

    {/* 5. Data Rules */}
    <div className="flex gap-10 items-start mt-20">
      <Database className="w-28 h-28 text-black-600 flex-shrink-0" />
      <div className="pt-2">
        <h2 className="text-3xl font-bold font-lato text-black mb-3">5. Data Rules</h2>
        <ul className="list-disc pl-5 text-[20px] text-justify font-lato text-gray-700">
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