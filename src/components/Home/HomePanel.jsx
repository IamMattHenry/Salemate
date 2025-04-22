import React from 'react'

export const HomePanel = ({children}) => {
  return (
    <div className="relative bg-whitesm/60 backdrop-invert-0 backdrop-opacity-10 block rounded-3xl mx-2 p-3 w-auto -mt-2">
      {children}
    </div>
  )
}