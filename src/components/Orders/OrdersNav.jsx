import React from "react";
import useModal from "../../hooks/Modal/UseModal";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { LiaFileDownloadSolid } from "react-icons/lia";
import { IoIosSearch } from "react-icons/io";
import NavTabs from "../common/NavTabs";

const OrdersNav = () => {
  const { modal, toggleModal } = useModal();

  const orderNavLinks = [
    { path: "/orders/all-transactions", label: "All Transactions" },
    { path: "/orders/completed-transactions", label: "Completed" },
    { path: "/orders/pending-transactions", label: "Pending" },
    { path: "/orders/cancelled-transactions", label: "Cancelled" },
    { path: "/orders/saved-history", label: "Saved History" },
  ];

  const searchProps = {
    placeholder: "Type name or date (mm/dd/yyyy)",
    icon: IoIosSearch
  };

  const actionButton = {
    icon: LiaFileDownloadSolid,
    onClick: toggleModal
  };

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
      
      <NavTabs 
        links={orderNavLinks}
        searchProps={searchProps}
        actionButton={actionButton}
      />
    </>
  );
};

export default OrdersNav;