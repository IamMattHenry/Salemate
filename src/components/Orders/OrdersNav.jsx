import React from "react"; 
import { NavLink } from "react-router-dom";
import { LiaFileDownloadSolid } from "react-icons/lia";
import { IoIosSearch } from "react-icons/io";
import useModal from "../../hooks/Modal/UseModal";
import { AnimatePresence, motion } from "motion/react";
import { FaCheckCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";

const OrdersNav = () => {
  const OrderNavLinks = [
    { path: "/orders/all-transactions", label: "All Transactions" },
    { path: "/orders/completed-transactions", label: "Completed" },
    { path: "/orders/pending-transactions", label: "Pending" },
    { path: "/orders/cancelled-transactions", label: "Cancelled" },
    { path: "/orders/saved-history", label: "Saved History" },
  ];

  const { modal, toggleModal } = useModal();

  // Search Function
  return (
    <>
      {modal && (
        <AnimatePresence>
          <motion.div
            className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white h-auto w-[20rem] rounded-3xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-3xl flex items-center justify-end text-gray-500 p-3">
                <div className="cursor-pointer" onClick={toggleModal}> 
                  <MdCancel className="size-5"/>
                </div>
              </div>
              <div className="flex w-full justify-center items-center flex-col h-64 space-y-3">
                <FaCheckCircle className="size-14 text-[#0cd742]"/>
                <h3 className="font-bold text-2xl pt-1">Order History Saved!</h3>
                <span className="text-[.8rem]">Your order history has been saved!</span>
                <button
                  className="bg-[#0cd742] text-white text-center py-1 mt-3 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                  type="button" onClick={toggleModal}>
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      <div className="w-full grid grid-cols-[60%_1fr] h-auto place-content-center">
        <div className="font-lato font-bold text-[1.05rem] space-x-2 flex w-[80%] justify-around items-center">
          {OrderNavLinks.map((orderLinks) => (
            <NavLink
              key={orderLinks.path}
              to={orderLinks.path}
              className={({ isActive }) =>
                `
                  ${isActive
                    ? 'relative after:content-[""] after:absolute after:bottom-0 after:left-1/4 after:w-1/2 after:h-0.5 after:bg-current'
                    : 'relative hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-1/4 hover:after:w-1/2 hover:after:h-0.5 hover:after:bg-current transition-all'}
                `
              }
            >
              <span>{orderLinks.label}</span>
            </NavLink>
          ))}
        </div>
        {/* Save File Function */}
        <div>
          <div className=" flex justify-end w-full">
            <div className="flex justify-around items-center w-[80%]">
              <div className="relative w-4/6">
                <input
                  type="text"
                  placeholder="Type name or date (mm/dd/yyyy)"
                  className="font-lato bg-white border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-sm placeholder:text-gray-500 w-full"
                />
                <IoIosSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
              </div>
              <div>
                <button
                  type="button"
                  className="text-gray-600 p-1 border-gray-600 border rounded-4xl cursor-pointer"
                  onClick={toggleModal}
                >
                  <LiaFileDownloadSolid />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrdersNav;
