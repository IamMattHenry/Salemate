import React from "react";
import { IoIosSearch, IoMdAddCircleOutline } from "react-icons/io";
import { LiaFileDownloadSolid } from "react-icons/lia";
import { FaCheckCircle, FaBan } from "react-icons/fa";
import { X } from "lucide-react";
import NavTabs from "../common/NavTabs";
import useModal from "../../hooks/Modal/UseModal";
import { AnimatePresence, motion } from "framer-motion";

const InventoryNav = () => {
  const { modal, toggleModal } = useModal(); // success modal
  const { modal: saveModal, toggleModal: toggleSaveModal } = useModal(); // add item modal
  const { modal: ItemAddedModal, toggleModal: toggleConfirmationModal } = useModal(); // item added modal

  const inventoryNavLinks = [
    { path: "/inventory/daily-inventory", label: "Daily Inventory" },
    { path: "/inventory/save-history", label: "Save History" },
  ];

  const searchProps = {
    placeholder: "Type name or date (mm/dd/yy)",
    icon: IoIosSearch,
  };

  const actionButton = {
    icon: LiaFileDownloadSolid,
    onClick: toggleModal,
  };

  const saveButton = {
    icon: IoMdAddCircleOutline,
    label: "Add Item",
    onClick: toggleSaveModal,
  };

  return (
    <>
      {/* ✅ Success Modal */}
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
                  <X className="size-6 text-white" />
                </div>
              </div>
              <div className="flex w-full justify-center items-center flex-col h-64 space-y-3">
                <FaCheckCircle className="size-14 text-[#0cd742]" />
                <h3 className="font-bold text-2xl pt-1">Order History Saved!</h3>
                <span className="text-[.8rem] text-center justify-center">
                  Inventory document has been saved!<br />
                  Click save history to see the document.
                </span>
                <button
                  className="bg-[#0cd742] shadow-[inset_3px_3px_5px_rgba(0,0,0,0.2)] text-white text-center py-1 mt-3 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                  type="button"
                  onClick={toggleModal}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ❌ Error Modal Placeholder */}
      {false && (
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
                  <X className="size-6 text-white" />
                </div>
              </div>
              <div className="flex w-full justify-center items-center flex-col h-64 space-y-3">
                <FaBan className="size-14 text-red-500" />
                <h3 className="font-bold text-2xl pt-1">Can’t Save</h3>
                <span className="text-[.8rem] text-center px-4">
                  You can only save one time. Please see the saved report on
                  saved history.
                </span>
                <button
                  className="bg-red-500 text-white text-center py-1 mt-3 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                  type="button"
                  onClick={toggleModal}
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ✅ Add Item Modal */}
      {saveModal && (
        <AnimatePresence>
          <motion.div
            className="h-screen w-screen bg-black/25 flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white h-[18rem] w-[75rem] rounded-3xl font-lato p-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full flex items-center justify-between text-gray-500 mb-4">
                <h2 className="text-[35px] font-bold text-black pt-3 pl-5">Adding Item in Inventory</h2>
                <div className="mr-2 mb-6 bg-red-500 rounded cursor-pointer" onClick={toggleSaveModal}>
                  <X className="size-6 text-white"/>
                </div>
              </div>

              <form className="flex grid items-center grid-cols-6 w-full">
                <div className="pl-7">
                  <h2 className="font-league spartan font-semibold text-[23px] pb-3 pl-2">Raw Materials</h2>
                <input type="text" placeholder="" className="w-40 px-3 py-2 border rounded-lg text-sm" />
                  <h2 className="font-lato italic text-gray-500 text-[10px] pt-2 tracking-tighter">Type letters from a-z (special characters are not allowed)</h2>
                </div>
                <div className="ml-10">
                <h2 className="font-league spartan font-semibold text-[23px] pb-3 -pl-2">Purchased</h2>
                <input type="number" placeholder="" className="w-25 px-3 py-2 border rounded-lg text-sm" />
                <h2 className="font-lato italic text-gray-500 text-[10px] pt-2 tracking-tighter">If purchased in grams, type g<br/> after the number.</h2>
                </div>
                <div className="-ml-2 -mt-5">
                <h2 className="font-league spartan font-semibold text-[23px] pb-3">Processed/Used</h2>
                <input type="number" placeholder="" className="w-42 px-3 py-2 border rounded-lg text-sm" />
                <h2 className="font-lato italic text-gray-500 text-[10px] pt-2 tracking-tighter">If purchased in grams, type g after the number.</h2>
                </div>
                <div className="ml-1 -mt-5">
                <h2 className="font-league spartan font-semibold text-[23px] text-[gray] pb-3">Waste</h2>
                <input type="number" placeholder="" className="w-30 px-3 py-2 border rounded-lg text-sm bg-gray-300 border-gray-400 cursor-not-allowed" readOnly />
                <h2 className="font-lato italic text-gray-500 text-[10px] pt-2 tracking-tighter">Type g after the number if grams.</h2>
                </div>
                <div className="-ml-10 -mt-5">
                <h2 className="font-league spartan font-semibold text-[23px] text-[gray] -mr-10 pb-3">Beginning Inventory</h2>
                <input type="number" placeholder="" className="w-47 px-3 py-2 border rounded-lg text-sm bg-gray-300 border-gray-400 cursor-not-allowed" readOnly />
                <h2 className="font-lato italic text-gray-500 text-[10px] pt-2 tracking-tighter">Type g after the number if grams.</h2>
                </div>
                <div className="-mt-10">
                <h2 className="font-league spartan font-semibold text-[23px] text-[gray] pb-3">Ending Inventory</h2>
                <input type="number" placeholder="" className="w-40 px-3 py-2 border rounded-lg text-sm bg-gray-300 border-gray-400 cursor-not-allowed" readOnly />
                </div>
              </form>
                <div className="ml-260">
                <button
                className="bg-[#FFCF50] text-black text-center h-9 w-27 py-1 mt-3 px-8.5 rounded-2xl font-league spartan font-semibold text-[0.90rem] cursor-pointer hover:bg-black/70"
                type="button"
                onClick={toggleConfirmationModal}
              >
                Enter
              </button>
                </div>

            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ✅ ItemAddedModal */}
      {ItemAddedModal && (
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
              <div className="cursor-pointer" onClick={toggleConfirmationModal}>
                <X className="size-6 text-white" />
              </div>
            </div>
            <div className="flex w-full justify-center items-center flex-col h-64 space-y-3">
              <FaCheckCircle className="size-14 text-[#0cd742]" />
              <h3 className="font-bold text-2xl pt-1 text-center">Item Successfully<br/> Added!</h3>
              <span className="text-[.8rem] text-center justify-center">
              Your item has been successfully<br/> added to the inventory!
              </span>
              <button
                className="bg-[#0cd742] shadow-[inset_3px_3px_5px_rgba(0,0,0,0.2)] text-white text-center py-1 mt-3 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
                type="button"
                onClick={toggleConfirmationModal}
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      )}

      <NavTabs
        links={inventoryNavLinks}
        searchProps={searchProps}
        saveButton={saveButton}
        actionButton={actionButton}
        className="justify-start w-full"
      />
    </>
  );
};

export default InventoryNav;
