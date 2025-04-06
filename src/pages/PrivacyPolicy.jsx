import React from "react";
import { HomePanel } from "../components/Home/HomePanel";
import { HomeRoutes } from "../components/Home/HomeRoutes";

function PrivacyPolicy() {
  return (
    <div>
      <div className="heading-quote min-w-auto md:w-10/12 flex mx-auto md:flex-row my-10 justify-between p-7">
        <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] flex-start">
          <h1 className="font-lato font-semibold text-2xl md:text-4xl">
            Privacy Policy
            <br />
          </h1>
          <span className="mt-5 font-lato text-lg md:text-lg text-justify">
          Salemate is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and share information when you use our web application
          </span>
          <br />
        </div>
        <div className="border w-[40%]">
          <img alt="policy-image"></img>
        </div>
      </div>
      <HomeRoutes />
      <HomePanel>
      <div className=" grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white md:h-[1100px] flex flex-col items-center shadow-feat rounded-2xl py-10 overflow-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="bi bi-key-fill bg-redct md:p-5 rounded-[50%] h-[75px] md:h-[75px] w-[75px] md:w-[75px] inset-ring inset-ring-black/25"
                viewBox="0 0 16 16"
              >
                <path d="M3.5 11.5a3.5 3.5 0 1 1 3.163-5H14L15.5 8 14 9.5l-1-1-1 1-1-1-1 1-1-1-1 1H6.663a3.5 3.5 0 0 1-3.163 2M2.5 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2" />
              </svg>
              <div className="w-[75%] space-y-5">
                <h3 className="font-lato font-semibold md:text-md mt-10 border-b-2 border-gray-400 pb-6">
                  1. Information We Collect
                </h3>
                <p className="font-lato text-justify md:text-sm">
                  We may collect the following types of information when you use
                  our Web App:<br></br>
                </p>
                <ul className="list-inside list-disc font-lato md:text-sm">
                  <li>
                    Personal Information: When you sign up for an account, we
                    may collect personal information such as your name, email
                    address, phone number, and payment details.
                  </li>
                  <li>
                    Cookies and Tracking Technologies: We use cookies and
                    similar technologies to enhance your user experience, track
                    usage patterns, and collect data for analytics purposes. You
                    can manage your cookie preferences in your browser settings.
                  </li>
                  <li>
                    Usage Data: We automatically collect information about how
                    you interact with our Web App, such as your IP address,
                    device type, browser type, and pages you visit.
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-white md:h-[1100px] flex flex-col items-center shadow-feat rounded-2xl py-10 overflow-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="bi bi-cloud-download-fill bg-redct md:p-5 rounded-[50%] h-[75px] md:h-[75px] w-[75px] md:w-[75px] inset-ring inset-ring-black/25"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.5a.5.5 0 0 1 1 0V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0m-.354 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V11h-1v3.293l-2.146-2.147a.5.5 0 0 0-.708.708z"
                />
              </svg>
              <div className="w-[75%] space-y-5">
                <h3 className="font-lato font-semibold md:text-md mt-10 border-b-2 border-gray-400 pb-6">
                  2. How We Use Your Information
                </h3>
                <p className="font-lato text-justify md:text-sm">
                  We use the information we collect for the following purposes:
                  <br></br>
                </p>
                <ul className="list-inside list-disc font-lato md:text-sm">
                  <li>
                    To provide, maintain, and improve our Web App and services.
                  </li>
                  <li>
                    To personalize your experience and respond to your
                    inquiries.
                  </li>
                  <li>
                    To process transactions and send related communications.
                  </li>
                  <li>
                    To send you promotional emails or updates about our Web App,
                    if you have opted in.
                  </li>
                  <li>
                    To comply with legal obligations and enforce our Terms of
                    Service.
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-white md:h-[1100px] flex flex-col items-center shadow-feat rounded-2xl py-10 overflow-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                class="bi bi-info-circle-fill bg-redct md:p-5 rounded-[50%] h-[75px] md:h-[75px] w-[75px] md:w-[75px] inset-ring inset-ring-black/25"
                viewBox="0 0 16 16"
              >
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
              </svg>
              <div className="w-[75%] space-y-5">
                <h3 className="font-lato font-semibold md:text-md mt-10 border-b-2 border-gray-400 pb-6">
                  3. How We Share Your Information
                </h3>
                <p className="font-lato text-justify md:text-sm">
                  We do not sell, rent, or trade your personal information.
                  However, we may share your data in the following
                  circumstances:<br></br>
                </p>
                <ul className="list-inside list-disc font-lato md:text-sm">
                  <li>
                    Service Providers: We may share your information with
                    trusted third-party vendors or service providers who assist
                    us in operating our Web App and providing services to you.
                  </li>
                  <li>
                    Legal Requirements: We may disclose your information if
                    required by law or in response to legal requests, such as
                    subpoenas or court orders.
                  </li>
                  <li>
                    Business Transfers: In the event of a merger, acquisition,
                    or sale of assets, your information may be transferred to
                    the new entity.
                  </li>
                </ul>
              </div>
            </div>
          </div>
      </HomePanel>
    </div>
  );
}

export default PrivacyPolicy;
