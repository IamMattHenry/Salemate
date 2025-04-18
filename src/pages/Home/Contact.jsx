import React from "react";
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";

function Contact() {
  return (
    <div>
      <div className="min-w-auto md:w-10/12 flex mx-auto md:flex-row my-25 justify-between px-12 items-center">
        <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] items-start">
          <h1 className="font-lato font-semibold text-2xl md:text-7xl">
            Contact Us
          </h1>
          <span className="mt-5 font-lato text-[23px] text-justify">
            If you have any questions or concerns regarding this Privacy Policy
            or our data practices, or if you would like to exercise your privacy
            rights, please reach out to us using the contact information below:
          </span>
        </div>
        <div className="w-[50%] flex justify-end">
          <img src="/Cntct_1.png" alt="contact illustration" />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <HomeRoutes />
        <HomePanel>
          <div className="w-full p-5">
            {/* Added padding top/bottom */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
              {/* Address */}
              <div className="bg-white flex flex-col items-center shadow-feat rounded-2xl py-30 min-h-[340px] w-[340px]">
                <div className="bg-redct md:p-5 rounded-full h-[75px] w-[75px] inset-ring inset-ring-black/25 flex justify-center items-center">
                  <img
                    src="/Address_1.png"
                    alt="address icon"
                    className="w-[40px] h-[40px]"
                  />
                </div>
                <div className="w-[75%] space-y-5 mt-10">
                  <h3 className="font-lato font-semibold md:text-md border-b-2 border-gray-400 pb-6 text-center">
                    Address
                  </h3>
                  <p className="font-lato text-center md:text-sm">
                    673 Quirino Hwy, Novaliches,
                    <br />
                    Quezon City, Metro Manila
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white flex flex-col items-center shadow-feat rounded-2xl py-30 min-h-[340px] w-[340px]">
                <div className="bg-redct md:p-5 rounded-full h-[75px] w-[75px] inset-ring inset-ring-black/25 flex justify-center items-center">
                  <img
                    src="/email_1.png"
                    alt="email icon"
                    className="w-[40px] h-[40px]"
                  />
                </div>
                <div className="w-[75%] space-y-5 mt-10">
                  <h3 className="font-lato font-semibold md:text-md border-b-2 border-gray-400 pb-6 text-center">
                    Email
                  </h3>
                  <p className="font-lato text-center md:text-sm">
                    sampleadmin@gmail.com
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-white flex flex-col items-center shadow-feat rounded-2xl py-30 min-h-[340px] w-[340px]">
                <div className="bg-redct md:p-5 rounded-full h-[75px] w-[75px] inset-ring inset-ring-black/25 flex justify-center items-center">
                  <img
                    src="/phone_1.png"
                    alt="phone icon"
                    className="w-[40px] h-[40px]"
                  />
                </div>
                <div className="w-[75%] space-y-5 mt-10">
                  <h3 className="font-lato font-semibold md:text-md border-b-2 border-gray-400 pb-6 text-center">
                    Contact Number
                  </h3>
                  <p className="font-lato text-center md:text-sm">
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
  );
}

export default Contact;
