import React from "react";
import { IoIosArrowDown } from "react-icons/io";
import useModal from "../../../hooks/Modal/UseModal";
import { AnimatePresence, motion } from "motion/react";
import { IoMdInformationCircle } from "react-icons/io";
import { MdCancel } from "react-icons/md";

const OrderStatusDropdown = () => {
  const { modal, toggleModal } = useModal();

  return (
    <>
      <button type="button" onClick={toggleModal} className="cursor-pointer">
        <IoIosArrowDown />
      </button>

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
              className="bg-white h-auto w-[30rem] rounded-3xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-3xl flex items-center justify-between bg-[#0cd742] text-white py-2 px-3">
                <div className="flex items-center text-center justify-center space-x-1.5">
                  <IoMdInformationCircle className="text-lg" />
                  <span className="font-semibold text-lg pt-1">
                    Order Info
                  </span>
                </div>
                <div>
                  <MdCancel className="cursor-pointer text-lg" onClick={toggleModal} />
                </div>
              </div>
              <div className="flex w-full justify-between p-4">
                <div>
                  <h3 className="font-bold text-lg">Order ID: </h3>
                  <span className=" font-medium">Status:</span>
                  <br />
                  <span className=" font-medium">Recipient Name:</span>
                </div>
                <div>
                  <span className=" font-medium">Date:</span>
                  <br />
                  <span className=" font-medium">Time:</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 w-full mb-6 px-4">
                <div className="flex justify-start flex-col bg-yellowsm/20 size-32 p-3 shadow-feat w-full rounded-xl">
                  <h4 className="font-bold text-[1rem] mb-3">Order(s)</h4>
                  <span className="font-normal">test</span>
                </div>
                <div className="flex justify-start flex-col bg-yellowsm/20 p-3 size-32 shadow-feat w-full rounded-xl">
                  <h4 className="font-semibold text-[1rem] mb-3">Order(s)</h4>
                  <span className="font-normal">test</span>
                </div>
                <div className="flex justify-start flex-col bg-yellowsm/20 size-32 p-3 shadow-feat w-full rounded-xl">
                  <h4 className="font-semibold text-[1rem] mb-3">Order(s)</h4>
                  <span className="font-normal">test</span>
                </div>
                <div className="flex justify-start flex-col bg-yellowsm/20 size-32 p-3 shadow-feat w-full rounded-xl">
                  <h4 className="font-semibold text-[1rem] mb-3">Order(s)</h4>
                  <span className="font-normal">test</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default OrderStatusDropdown;
