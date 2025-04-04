import React from 'react'

export const HomePanel = ({children}) => {
  return (
    <div className="bg-whitesm/40 backdrop-invert-0 backdrop-opacity-10 block mx-auto rounded-3xl md:w-11/12 md:p-12 h-auto">
      {children}
    </div>
  )
}
