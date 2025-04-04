import React from 'react'
import { HomePanel } from '../components/HomePanel'
import { HomeRoutes } from '../components/HomeRoutes'

const Features = () => {
  return (
    <div>
        <div className="heading-quote min-w-auto md:w-10/12 flex mx-auto md:flex-row my-10 justify-between p-7">
                <div className="flex flex-col lg:flex-col w-[50%] md:w-[40%] flex-start">
                  <h1 className="font-lato font-semibold text-2xl md:text-4xl">
                    Features
                    <br />
                  </h1>
                  <span className="mt-5 font-lato text-lg md:text-lg text-justify">
                    FEATURES DESCRIPTION
                  </span>
                  <br />
                </div>
                <div className="border w-[40%]">
                  <img alt="features-image"></img>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <HomeRoutes />
                <HomePanel>Feature: TO-DO</HomePanel>
              </div>
    </div>
  )
}

export default Features