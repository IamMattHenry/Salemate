import React from "react";
import { useState } from "react";
import { IoMdTime, IoMdTrash, IoMdInformationCircle } from "react-icons/io";
import { FaEdit, FaCheckCircle } from "react-icons/fa";
import { IoCalendar, IoPencil } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import useModal from "../../hooks/Modal/UseModal";
import successModal from "../../hooks/Modal/SuccessModal";
import nameModal from "../../hooks/Modal/EnterNameModal";
import { AnimatePresence, motion } from "motion/react";

const dateToday = new Date();
const timeToday = dateToday.toLocaleTimeString([], {
  hour: "2-digit",
  minute: "2-digit",
});
const dateFormat = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const formattedDate = dateToday.toLocaleDateString("en-US", dateFormat);

const DashboardOrder = ({ product }) => {
  const [orderNumber, setOrderNumber] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const { okayModal, showSuccessModal } = successModal();
  const { modal, toggleModal } = useModal();
  const { inputNameModal, showNameModal } = nameModal();

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  const increaseQuantity = () => {
    if (quantity >= 1) {
      setQuantity(quantity + 1);
    }
  };

  return (
    <>
      {/* Enter Name Modal */}
      {inputNameModal && (
        <AnimatePresence>
          <motion.div
            className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[18rem] h-auto pb-3 rounded-xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-xl flex items-center justify-between bg-[#0cd742] text-white py-2 px-3">
                <div className="flex items-center text-center justify-center space-x-1.5">
                  <IoMdInformationCircle className="text-sm" />
                  <span className="font-semibold text-sm pt-1">Add Item</span>
                </div>
                <div>
                  <MdCancel className="cursor-pointer" onClick={toggleModal} />
                </div>
              </div>
              <div className="w-auto h-auto justify-center flex flex-col items-center pt-5">
                <div className="space-y-2">
                  <span className="text-sm">
                    Please enter the customer's name:
                  </span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="e.g. Juan Dela Cruz"
                        className="font-lato border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-xs placeholder:text-gray-500 w-full bg-gray-300 shadow"
                      />
                      <FaEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-center mx-a">
                    <button
                      className="bg-[#0cd742] text-white text-center py-1 mt-1 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                      type="submit"
                      onClick={() => {
                        showNameModal();
                        toggleModal();
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      {/* Success Modal */}
      <AnimatePresence>
        {okayModal && (
          <motion.div
            className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[17rem] h-auto pb-5 rounded-4xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-4xl flex items-center flex-col text-black pt-4 px-3">
                <div className="flex items-center flex-col text-center space-x-1.5">
                  <FaCheckCircle className="size-14 text-[#0cd742]" />
                  <span className="font-bold text-2xl pt-1">
                    Order Completed
                  </span>
                  <div>
                    <div className="w-auto h-auto justify-center flex flex-col items-center mt-2">
                      <div className="space-y-2 w-[80%]">
                        <span className="text-[.9rem]">
                          Congrats! You have ordered successfully
                        </span>
                      </div>
                      <button
                        className="bg-[#0cd742] text-white text-center py-1 mt-3 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                        type="submit"
                        onClick={() => {
                          showSuccessModal();
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* confirm modal */}
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
              className="bg-white h-auto pb-5 w-[25rem] rounded-3xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-3xl flex items-center justify-between bg-[#0cd742] text-white py-2 px-3">
                <div className="flex items-center text-center justify-center space-x-1.5">
                  <IoMdInformationCircle className="text-sm" />
                  <span className="font-semibold text-sm pt-1">
                    Confirm Order
                  </span>
                </div>
                <div>
                  <MdCancel className="cursor-pointer" onClick={toggleModal} />
                </div>
              </div>
              <div className="grid grid-rows-[1rem_1fr] h-[60%] w-auto pt-2 gap-y-2 px-3">
                <div className="flex justify-between">
                  <h3 className="font-medium">Order 12345</h3>
                  <h3 className="text-gray-500">Cash Payment</h3>
                </div>
                <div className="pt-3 space-y-1">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">Spicy</span>
                      <span className="text-gray-500 text-xs">Total: 250</span>
                    </div>
                    <span className="text-gray-500 text-xs">x1</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold">Spicy</span>
                      <span className="text-gray-500 text-xs">Total: 250</span>
                    </div>
                    <span className="text-gray-500 text-xs">x2</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs font-medium">Total: 750</span>
                    <div>
                      <span className="text-gray-500 text-xs">x3</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="items-center flex justify-center mt-4">
                <button
                  className="text-sm font-lato font-bold bg-[#0cd742] rounded-3xl border-[0.5px] border-green-950 py-1 text-white px-5.5 cursor-pointer hover:bg-black/70"
                  onClick={() => {
                    toggleModal();
                    showSuccessModal();
                  }}
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      <div className="bg-white shadow-feat p-4 h-full">
        <div className="flex items-center justify-between">
          <h3 className="font-lato font-bold text-2xl">
            Order {orderNumber}:{" "}
          </h3>
          <div className="font-latrue text-xs font-semibold space-x-4 flex">
            <span className="flex gap-1">
              <IoMdTime />
              {timeToday}{" "}
            </span>
            <span className="flex gap-1">
              <IoCalendar />
              {formattedDate}
            </span>
          </div>
        </div>
        <div className="space-y-1 mt-5 mx-3">
          <h4 className="font-latrue font-semibold text-sm mb-4">
            Mode of Payment:
          </h4>
          <div className="font-semibold font-latrue text-[.87rem] flex items-center justify-between">
            <div className="space-x-3">
              <button
                className="border rounded-3xl py-1 px-6 cursor-pointer hover:bg-yellowsm/20 transition 
                  shadow-[inset_4px_4px_5px_0_rgba(0,0,0,0.1),inset_0_2px_3px_0_rgba(0,0,0,0.1)]"
              >
                Cash
              </button>
              <button
                className="border rounded-3xl py-1 px-6 cursor-pointer hover:bg-yellowsm/20 transition 
                  shadow-[inset_4px_4px_5px_0_rgba(0,0,0,0.1),inset_0_2px_3px_0_rgba(0,0,0,0.1)]"
              >
                Online
              </button>
            </div>
            <div className="text-red-600 text-2xl cursor-pointer">
              <IoMdTrash />
            </div>
          </div>
        </div>
        <div className="h-[17.3rem] -mx-4 mt-7 flex flex-col space-y-5 overflow-y-auto product-scroll">
          {/* Nag seed lang ako ng data para mapakita itsura ninya pag may data na. Gagawin ko ring dynamic 'to soon*/}
          <div className=" grid grid-cols-[20%_1fr_35%] gap-2 items-center bg-gray-400/5 p-4 w-full">
            <div>
              <img
                src={product.url}
                alt="katsu"
                className="size-20 rounded-[50%]"
              />
            </div>
            <div className="flex flex-col justify-start font-latrue">
              <span className="font-semibold text-lg">{product.title}</span>
              <span className="text-sm text-gray-500 font-latrue -mt-2 mb-2">
                {product.description}
              </span>
              <span className="text-xs font-bold">&#8369; {product.price}</span>
            </div>
            <div className=" font-latrue font-bold text-sm text-center flex flex-col justify-between h-full">
              <div className="text-sm flex justify-end space-x-1">
                <IoPencil />
                <MdCancel className="text-red-600" />
              </div>
              <div className="space-x-2 flex items-center justify-end">
                <button
                  onClick={decreaseQuantity}
                  className="cursor-pointer text-xl"
                >
                  -
                </button>
                <input
                  type="text"
                  placeholder={quantity}
                  className="border-[0.5px] border-gray-500 w-[50%] text-center rounded-xl"
                />
                <button
                  onClick={increaseQuantity}
                  className="cursor-pointer text-xl"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-rows-2 bg-gray-300/30 -mx-4 py-5 px-10 gap-2 mt-3">
          <div className="flex justify-between">
            <span className="font-semibold font-latrue text-[1rem]">
              Number of Products:
            </span>
            <span className="font-medium font-latrue text-[1rem]">3x</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold font-latrue text-[1rem]">
              Subtotal:
            </span>
            <span className="font-medium font-latrue text-[1rem]">
              &#8369; 1050
            </span>
          </div>
        </div>
        <div className="h-[3.3rem] items-center flex justify-end mt-3">
          <button
            className="text-sm font-latrue font-bold bg-[#0cd742] rounded-3xl border-[0.5px] border-green-950 py-2 text-white px-4 cursor-pointer hover:bg-black/70"
            onClick={showNameModal}
          >
            Checkout
          </button>
        </div>
        {/* TO-DO: Add item, Customer Name, Order Receipt */}
      </div>
    </>
  );
};

export default DashboardOrder;
