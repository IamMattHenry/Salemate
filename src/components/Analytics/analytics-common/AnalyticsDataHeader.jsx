import React from 'react'

const AnalyticsDataHeader = ({sectionHeader}) => {
  return (
    <div className='flex flex-col w-full bg-yellowsm/30 rounded-t-2xl font-lato pt-3 pb-1 pl-8'>
            <h5 className='font-medium text-xl'>{sectionHeader.label}</h5>
            <span className='text-gray-500 text-[.95rem] -mt-2'>{sectionHeader.date}</span>
    </div>
  )
}

export default AnalyticsDataHeader