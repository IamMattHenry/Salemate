import React from "react";
import { HomePanel } from "../../components/Home/HomePanel";
import { HomeRoutes } from "../../components/Home/HomeRoutes";

function Contact() {
  return (
    <div>
      <div className="heading-quote min-w-auto md:w-10/12 flex mx-auto md:flex-row my-10 justify-between p-7">
        <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] flex-start">
          <h1 className="font-lato font-semibold text-2xl md:text-4xl">
            Contact Us
            <br />
          </h1>
          <span className="mt-5 font-lato text-lg md:text-lg text-justify">
            If you have any questions or concerns regarding this Privacy Policy
            or our data practices, or if you would like to exercise your privacy
            rights, please reach out to us using the contact information below:
          </span>
          <br />
        </div>
        <div className=" mr-100 w-[20%]">
        <img src="/Cntct_1.png" alt="contact-image" className=" w-full h-auto rounded-lg shadow-md" />
        </div>
      </div>
      <div className="flex flex-col items-center">
        <HomeRoutes />
        <HomePanel>
        <div className="flex justify-between space-x-6">
        {/* First Div */}
        <div className="bg-white md:h-[600px] w-[500px] flex flex-col items-center shadow-feat rounded-2xl py-10 overflow-auto"> 
           <div className="bg-redct h-[120px] w-[120px] rounded-full flex justify-center items-center mt-15">
              <img src="/Address_1.png" alt="contact-image" className="w-[70px] h-[50px]" />  
           </div>
            <h1 className="font-lato font-medium text-xl mt-12">Address</h1> 
            <div className="h-px bg-black w-100 mt-12"></div>
            <h1 className="font-lato font-light text-xl mt-12">673 Quirino Hwy, Novaliches, <br /> Quezon City, Metro Manila</h1>
        </div>

         {/* Second Div */}
        <div className="bg-white md:h-[600px] w-[500px] flex flex-col items-center shadow-feat rounded-2xl py-10 overflow-auto"> 
          <div className="bg-redct h-[120px] w-[120px] rounded-full flex justify-center items-center mt-15">
            <img src="/email_1.png" alt="contact-image" className="w-[70px] h-[50px]" />  
          </div>
          <h1 className="font-lato font-medium text-xl mt-12">Email</h1> 
          <div className="h-px bg-black w-100 mt-12"></div>
          <h1 className="font-lato font-light text-xl mt-12">sampleadmin@gmail.com</h1>
        </div>

        {/* Third Div */}
        <div className="bg-white md:h-[600px] w-[500px] flex flex-col items-center shadow-feat rounded-2xl py-10 overflow-auto"> 
          <div className="bg-redct h-[120px] w-[120px] rounded-full flex justify-center items-center mt-15">
            <img src="/phone_1.png" alt="contact-image" className="w-[70px] h-[50px]" />  
          </div>
          <h1 className="font-lato font-medium text-xl mt-12">Phone</h1> 
          <div className="h-px bg-black w-100 mt-12"></div>
          <h1 className="font-lato font-light text-xl mt-12 text-center"> Landline: 386325253 <br /> Smartphone: 09572365332</h1>
        </div>
      </div>

        

        </HomePanel>
      </div>
    </div>
  );
}

export default Contact;
