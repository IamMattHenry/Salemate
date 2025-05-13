 import React from "react";
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";

function Contact() {
  return (
    <div>
      <div className="min-w-auto md:w-10/12 flex mx-auto md:flex-row min-h-10/12 mb-45 justify-between px-12 items-center">
        <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] items-start">
          <h1 className="font-lato font-semibold text-2xl md:text-6xl">
            Contact Us
          </h1>
          <span className="mt-5 font-latrue text-[1.3rem] text-justify">
            If you have any questions or concerns regarding this Privacy Policy
            or our data practices, or if you would like to exercise your privacy
            rights, please reach out to us using the contact information below:
          </span>
        </div>
        <div className="w-[50%] flex justify-end">
          <img src="/Cntct_1.png" alt="contact illustration" />
        </div>
      </div>
      <div className="relative">
      <div className="flex flex-col items-center">
        <HomeRoutes className="-mt-30"/>
        <HomePanel>
          <div className="w-full">
            {/* Added padding top/bottom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Address */}
              <div className="bg-white flex flex-col items-center shadow-feat rounded-2xl py-20 space-y-5 min-h-[340px] w-[400px]">
                <div className="bg-redct md:p-5 rounded-full h-[100px] w-[100px] inset-ring inset-ring-black/25 flex justify-center items-center">
                  <img
                    src="/Address_1.png"
                    alt="address icon"

                  />
                </div>
                <div className="w-[75%] space-y-5 mt-10">
                  <h3 className="font-lato font-semibold md:text-xl border-b-2 border-gray-400/20 pb-6 text-center">
                    Address
                  </h3>
                  <p className="font-lato text-center md:text-lg mt-8">
                    673 Quirino Hwy, Novaliches,
                    <br />
                    Quezon City, Metro Manila
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white flex flex-col items-center shadow-feat rounded-2xl py-20 space-y-5 min-h-[340px] w-[400px]">
                <div className="bg-redct md:p-5 rounded-full h-[100px] w-[100px] inset-ring inset-ring-black/25 flex justify-center items-center">
                  <img
                    src="/email_1.png"
                    alt="email icon"

                  />
                </div>
                <div className="w-[75%] space-y-5 mt-10">
                  <h3 className="font-lato font-semibold md:text-xl border-b-2 border-gray-400/20 pb-6 text-center">
                    Email
                  </h3>
                  <p className="font-lato text-center md:text-lg mt-8">
                    sampleadmin@gmail.com
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white flex flex-col items-center shadow-feat rounded-2xl py-20 space-y-5 min-h-[340px] w-[400px]">
                <div className="bg-redct md:p-5 rounded-full h-[100px] w-[100px] inset-ring inset-ring-black/25 flex justify-center items-center">
                  <img
                    src="/phone_1.png"
                    alt="phone icon"
                  />
                </div>
                <div className="w-[75%] space-y-5 mt-10">
                  <h3 className="font-lato font-semibold md:text-xl border-b-2 border-gray-400/20 pb-6 text-center">
                    Contact Number
                  </h3>
                  <p className="font-lato text-center md:text-lg mt-8">
                    Landline: 3626253
                    <br />
                    Smartphone: 09197266332
                  </p>
                </div>
              </div>
            </div>
          </div>
        </HomePanel>
      </div>
      </div>

    </div>
  );
}

export default Contact;
