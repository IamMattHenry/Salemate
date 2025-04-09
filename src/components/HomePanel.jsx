import React from 'react'

export const HomePanel = ({children}) => {
  return (
    <div className="bg-whitesm/60 backdrop-invert-0 backdrop-opacity-10 block rounded-3xl w-[1300px] mx-auto md:px-12">
      {children}
    </div>
  )
}