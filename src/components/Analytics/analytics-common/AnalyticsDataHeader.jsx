import React from 'react'

const AnalyticsDataHeader = ({ sectionHeader }) => (
  <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 p-5 md:p-6 rounded-t-2xl border-b border-amber-200/50">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-amber-600/10 p-2.5 rounded-lg shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-amber-900 tracking-tight">
            {sectionHeader.label}
          </h1>
          <p className="text-sm text-amber-800 font-medium mt-0.5">
            {sectionHeader.date}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-md shadow-sm border border-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        <span className="text-sm text-amber-800 font-medium">Current Period</span>
      </div>
    </div>
  </div>
);

export default AnalyticsDataHeader;