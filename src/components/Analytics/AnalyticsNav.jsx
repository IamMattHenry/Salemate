import React from "react";
import { IoIosSearch } from "react-icons/io";
import { LiaFileDownloadSolid } from "react-icons/lia";
import { FaCheckCircle, FaBan } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import NavTabs from "../common/NavTabs";
import useModal from "../../hooks/Modal/UseModal";
import { AnimatePresence, motion } from "framer-motion";

const AnalyticsNav = () => {
  const { modal, toggleModal } = useModal();

  const analyticsNavLinks = [
    { path: "/analytics/daily-sales", label: "Daily Sales" },
    { path: "/analytics/product-sales", label: "Product Sales" },
    { path: "/analytics/customer-frequency", label: "Customer Frequency" },
    { path: "/analytics/save-history", label: "Save History" },
  ];

  const searchProps = {
    placeholder: "Type name or date (mm/dd/yy)",
    icon: IoIosSearch,
  };

  const actionButton = {
    icon: LiaFileDownloadSolid,
    onClick: toggleModal,
  };

  return (
    <>
      {/* Save Modal */}
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
                  <MdCancel className="size-5" />
                </div>
              </div>
              <div className="flex w-full justify-center items-center flex-col h-64 space-y-3">
                <FaCheckCircle className="size-14 text-[#0cd742]" />
                <h3 className="font-bold text-2xl pt-1">Order History Saved!</h3>
                <span className="text-[.8rem]">
                  Your order history has been saved!
                </span>
                <button
                  className="bg-[#0cd742] text-white text-center py-1 mt-3 px-8.5 rounded-2xl text-[0.77rem] cursor-pointer hover:bg-black/70"
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

      {/* Save Modal Error, will show once the user has already clicked the save modal */}
      {false && ( // TODO: Replace `false` with condition like `saveFailed === true`
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
                  <MdCancel className="size-5" />
                </div>
              </div>
              <div className="flex w-full justify-center items-center flex-col h-64 space-y-3">
                <FaBan className="size-14 text-red-500" />
                <h3 className="font-bold text-2xl pt-1">Can’t Save</h3>
                <span className="text-[.8rem] text-center px-4">
                  You can only save one time. Please see the saved report on saved history.
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

      <NavTabs
        links={analyticsNavLinks}
        searchProps={searchProps}
        actionButton={actionButton}
      />
    </>
  );
};

export default AnalyticsNav;
