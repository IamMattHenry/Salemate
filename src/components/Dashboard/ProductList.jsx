import React from "react";
import { IoIosAdd, IoIosSearch, IoMdInformationCircle } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { FaEdit, FaCheckCircle } from "react-icons/fa";
import useModal from "../../hooks/Modal/UseModal";
import { AnimatePresence, motion } from "motion/react";
import successModal from "../../hooks/Modal/SuccessModal";

const ProductList = ({ product }) => {
  const { modal, toggleModal } = useModal();
  const { okayModal, showSuccessModal } = successModal();

  return (
    <>
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
              className="bg-white size-[17rem] rounded-4xl font-lato"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-4xl flex items-center flex-col text-black pt-4 px-3">
                <div className="flex items-center flex-col text-center space-x-1.5">
                  <FaCheckCircle className="size-14 text-[#0cd742]" />
                  <span className="font-bold text-2xl pt-1">
                    Item Successfully Added
                  </span>
                  <div>
                    <div className="w-auto h-auto justify-center flex flex-col items-center mt-2">
                      <div className="space-y-2 w-[80%]">
                        <span className="text-[.9rem]">
                          Congrats! You have successfully added an item
                        </span>
                      </div>
                      <button
                        className="bg-[#0cd742] text-white text-center py-1 mt-3 px-5.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                        type="submit"
                        onClick={() => {
                          toggleModal();
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
      {/* Toggle Product Adding Modal */}
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
              className="bg-white size-[18rem] rounded-xl font-lato"
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
                  <span className="text-sm">Description:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Type description"
                        className="font-lato border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-xs placeholder:text-gray-500 w-full bg-gray-300 shadow"
                      />
                      <FaEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
                    </div>
                  </div>
                  <span className="text-sm">Name:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Type any item name"
                        className="font-lato border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-xs placeholder:text-gray-500 w-full bg-gray-300 shadow"
                      />
                      <FaEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
                    </div>
                  </div>
                  <span className="text-sm">Price:</span>
                  <div>
                    <div className="relative w-full">
                      <input
                        type="text"
                        placeholder="Type item price"
                        className="font-lato border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-xs placeholder:text-gray-500 w-full bg-gray-300 shadow"
                      />
                      <FaEdit className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    className="bg-[#0cd742] text-white text-center py-1 mt-3 px-5.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                    type="submit"
                    onClick={() => {
                      toggleModal();
                      showSuccessModal();
                    }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
      <div className="mt-10 w-full flex justify-between items-center">
        <h3 className="font-lato font-semibold text-xl">ALL PRODUCTS</h3>
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search"
            className="font-lato bg-white border-[1px] border-gray-500 pl-3 pr-7 pt-1 pb-0.5 rounded-2xl text-sm placeholder:text-gray-500 w-full"
          />
          <IoIosSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-5 min-h-[10.25rem]">
        <div className="bg-white rounded-xl flex items-center justify-center flex-col py-3 px-5 text-center shadow-feat">
          <img
            src={product.url}
            alt="product-img"
            className="object-contain rounded-[50%]"
          />
          <h3 className="font-lato font-semibold text-lg">{product.title}</h3>
          <span className="text-xs font-lato text-gray-500 font-semibold">
            {product.description}
          </span>
          <span className="font-bold text-sm font-lato mt-3">
            Price: {product.price}
          </span>
        </div>
        <div className="bg-white rounded-xl flex items-center justify-center flex-col py-3 px-5 text-center shadow-feat">
          <img
            src={product.url}
            alt="product-img"
            className="object-contain rounded-[50%]"
          />
          <h3 className="font-lato font-semibold text-lg">{product.title}</h3>
          <span className="text-xs font-lato text-gray-500 font-semibold">
            {product.description}
          </span>
          <span className="font-bold text-sm font-lato mt-3">
            Price: {product.price}
          </span>
        </div>
        <div
          className="bg-white rounded-xl flex items-center justify-center flex-col py-3 px-5 text-center shadow-feat cursor-pointer"
          onClick={toggleModal}
        >
          {" "}
          {/*ADD ITEM*/}
          <IoIosAdd className="text-gray-500 size-24" />
          <span className="font-medium text-sm font-lato text-gray-500 mt-[-10px]">
            Add Item
          </span>
        </div>
      </div>
    </>
  );
};

export default ProductList;
