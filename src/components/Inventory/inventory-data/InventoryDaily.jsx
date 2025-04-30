import { SquareMinus } from 'lucide-react'
import React from 'react'

const InventoryDaily = () => {
  return (
    <section className="bg-white rounded-2xl shadow-feat w-300 mx-auto block my-4 pb-5 px-5">
        
        {/*Label*/}
        <div className="grid grid-cols-7 text-[23px] tracking-tight font-medium text-center font-lato justify-center pt-7 -ml-5">
        <h2 className="ml-10 leading-[0.9] text-left">Raw<br/> Materials</h2>
        <h2 className="ml-14">Purchased</h2>
        <h2 className="text-left ml-14 leading-[1]">Processed<br/>/Used</h2>
        <h2>Waste</h2>
        <h2 className="leading-[0.9]">Beginning<br/> Inventory</h2>
        <h2 className="leading-[0.9] -ml-2">Ending<br/> Inventory</h2>
        <h2 className="mr-15">Status</h2>
        </div>

        <hr className='h-0.5 w-286 ml- mt-1 mb-2'/>
        {/*First (BEEF)*/}
        <div className="grid grid-cols-7 text-[25px] font-lato text-center justify-center bg-gray-100 w-[1145px] h-[60px] mb-2">
            <div className="flex">
              <SquareMinus className="opacity-30 mt-4 ml-5"/>
              <span className="mt-3 ml-2">Beef</span>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-7 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-3 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-1 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-3'>
              <h2 className="bg-[#0CD742] border border-[#067a25] text-center rounded-2xl w-25 font-league spartan font-bold text-[15px] h-9 pt-2 ml-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)]">High</h2>
            </div>
        </div>

          {/*Second (Puso)*/}
        <div className="grid grid-cols-7 text-[24px] font-lato text-center justify-center bg-gray-100 w-[1145px] h-[60px] mb-2">
            <div className="flex mr-">
              <SquareMinus className="opacity-30 mt-4 ml-5"/>
              <span className="tracking-tight mt-3 ml-2 -mr-15">Puso ng Saging</span>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-7 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-3 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-1 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
              <h2 className="bg-[#0CD742] border border-[#067a25] text-center rounded-2xl w-25 font-league spartan font-bold text-[15px] h-9 pt-2 ml-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)]">High</h2>
            </div>
        </div>

        {/*Third (POTATO)*/}
        <div className="grid grid-cols-7 text-[25px] font-lato text-center justify-center bg-gray-100 w-[1145px] h-[60px] mb-2">
            <div className="flex">
              <SquareMinus className="opacity-30 mt-4 ml-5"/>
              <span className="mt-3 ml-2">Potato</span>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-7 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-3 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-1 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
              <h2 className="bg-[#0CD742] border border-[#067a25] text-center rounded-2xl w-25 font-league spartan font-bold text-[15px] h-9 pt-2 ml-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)]">High</h2>
            </div>
        </div>

        {/*Fourth (GARLIC)*/}
        <div className="grid grid-cols-7 text-[25px] font-lato text-center justify-center bg-gray-100 w-[1145px] h-[60px] mb-2">
            <div className="flex">
              <SquareMinus className="opacity-30 mt-4 ml-5"/>
              <span className="mt-3 ml-2">Garlic</span>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-7 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-3 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-1 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
              <h2 className="bg-[#FFCF50] border border-[#B3861A] text-center rounded-2xl w-25 font-league spartan font-bold text-[15px] h-9 pt-2 ml-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)]">Moderate</h2>
            </div>
        </div>

        {/*Fifth (CUCUMBER)*/}
        <div className="grid grid-cols-7 text-[25px] font-lato text-center justify-center bg-gray-100 w-[1145px] h-[60px] mb-2">
            <div className="flex">
              <SquareMinus className="opacity-30 mt-4 ml-5"/>
              <span className="mt-3 ml-2 -mr-15">Cucumber</span>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-7 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-3 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-1 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
              <h2 className="bg-[#0CD742] border border-[#067a25] text-center rounded-2xl w-25 font-league spartan font-bold text-[15px] h-9 pt-2 ml-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)]">High</h2>
            </div>
        </div>

        {/*Last (Calamansi)*/}
        <div className="grid grid-cols-7 text-[25px] font-lato text-center justify-center bg-gray-100 w-[1145px] h-[60px] mb-2">
            <div className="flex">
              <SquareMinus className="opacity-30 mt-4 ml-5"/>
              <span className="mt-3 ml-2 -mr-15">Calamansi</span>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-7 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-3 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white ml-1 border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
            <input type="" className="bg-white border border-gray-500 text-sm text-gray-900 rounded-lg w-20 h-9 cursor-not-allowed" readOnly placeholder="  "/>
            </div>
            <div className='pt-2'>
              <h2 className="bg-[#FF3434] border border-[#B82323] text-center rounded-2xl w-25 font-league spartan font-bold text-[15px] h-9 pt-2 ml-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)]">Low</h2>
            </div>
        </div>

        <div className="grid grid-cols-2 pb-10 pt-5 p-5">
          <div className="flex pt-2 -ml-6">
            <h2 className="font-lato font-medium ml-3 pt-1">Clerk Name: </h2>
            <input type="" className="bg-gray-50 ml- border border-gray-500 text-[11px] text-gray-900 rounded-lg w-60 h-7 ml-1 -pt-4" placeholder="   Type name "/>
            <div className="-mt-0.5">
            <button type="button" className="bg-white border border-gray-300 font-medium font-lato text-[15px] w-20 h-8 hover:bg-gray-100 rounded-2xl ml-3 shadow-[0_5px_5px_rgba(0,0,0,0.3)]">Submit</button>
            </div>
          </div>

          <div className="flex ml-45 pt-2">
              <span className="bg-[#0CD742] border border-[#067a25] rounded-full w-4 h-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)]">   </span>
              <h2 className="font-lato italic opacity-[60%] leading-[1] pt-1 ml-1">High on<br/> Stocks</h2>

              <span className="bg-[#FFCF50] border border-[#B3861A] rounded-full w-4 h-4 ml-10 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)]">   </span>
              <h2 className="font-lato italic opacity-[60%] leading-[1] pt-1 ml-1">Moderate Stock<br/> Level</h2>

              <span className="bg-[#FF3434] border border-[#B82323] rounded-full w-4 h-4 ml-10 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)]">   </span>
              <h2 className="font-lato italic opacity-[60%] leading-[1] pt-1 ml-1">Low on<br/> Stocks</h2>
          </div>
        </div>


    </section>
  )
}

export default InventoryDaily

