import React, { useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { LiaFileDownloadSolid } from "react-icons/lia";
import { FaCheckCircle, FaBan } from "react-icons/fa";
import { X } from "lucide-react";
import NavTabs from "../common/NavTabs";
import useModal from "../../hooks/Modal/UseModal";
import { AnimatePresence, motion } from "framer-motion";
import { addDoc, collection, getFirestore, Timestamp } from 'firebase/firestore';
import firebaseApp from "../../firebaseConfig";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

const InventoryNav = () => {
  const db = getFirestore(firebaseApp);
  const { modal: saveModal, toggleModal: toggleSaveModal } = useModal(); // add item modal
  const { modal: ItemAddedModal, toggleModal: toggleConfirmationModal } = useModal(); // item added modal
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Function to create inventory notification when a new item is added
  const createInventoryAddedNotification = async (itemName, beginningInventory) => {
    try {
      if (!currentUser) {
        console.error("Cannot create notification: No user is logged in");
        return;
      }

      // Create a global notification
      const globalNotification = {
        type: 'inventory',
        message: `New inventory item added: ${itemName} (${beginningInventory}g)`,
        severity: 'normal',
        route: '/inventory/daily-inventory',
        module: 'inventory',
        resolved: false, // Set to false so it appears as an unresolved notification
        userId: 'global', // Special marker to indicate this is a global notification
        createdBy: currentUser.uid, // Track who created it
        createdByName: currentUser.email || 'Unknown user', // Include creator's name
        read: false,
        global: true, // Flag to indicate this is a global notification
        createdAt: Timestamp.now(),
        readBy: [] // Initialize empty array to track which users have read this notification
      };

      const notificationRef = await addDoc(collection(db, 'notifications'), globalNotification);
      console.log(`Created inventory item added notification with ID: ${notificationRef.id} for ${itemName}`);

    } catch (error) {
      console.error('Error creating inventory notification:', error);
    }
  };

  // Add state for form inputs
  const [formInputs, setFormInputs] = useState({
    rawMaterial: '',
    purchased: '',
    used: ''
  });

  // Add clerk name state
  const [clerkName, setClerkName] = useState('');
  const [clerkNameError, setClerkNameError] = useState(false);

  // Add error state
  const [formError, setFormError] = useState(false);

  // Add specific error message for raw material name
  const [rawMaterialError, setRawMaterialError] = useState('');

  // Update the handleAddItem function to remove setTimeout
  const handleAddItem = async (e) => {
    e.preventDefault();

    try {
      // Check if all required fields are filled
      if (!formInputs.rawMaterial || !formInputs.purchased || !clerkName) {
        setFormError(true);
        if (!clerkName) setClerkNameError(true);
        return;
      }

      // Validate raw material name again before submission
      if (!validateRawMaterialName(formInputs.rawMaterial)) {
        setRawMaterialError('Item name can only contain letters (no numbers or special characters)');
        return;
      }

      // Calculate beginning inventory (same as purchased amount for new items)
      const beginningInventory = Number(formInputs.purchased);

      // Add to database with clerk name, timestamp, and beginning inventory
      const newItem = {
        raw_mats: formInputs.rawMaterial,
        purchased: Number(formInputs.purchased),
        used: formInputs.used ? Number(formInputs.used) : 0,
        clerk_name: clerkName,
        timestamp: new Date().toISOString(),
        last_updated: new Date().toISOString(),
        begin_inv: beginningInventory, // Add beginning inventory
        ending_inv: beginningInventory - (formInputs.used ? Number(formInputs.used) : 0) // Calculate ending inventory
      };

      const docRef = await addDoc(collection(db, "inventory"), newItem);

      // Create a notification for the new inventory item
      await createInventoryAddedNotification(formInputs.rawMaterial, beginningInventory);

      // Reset form states
      setFormInputs({
        rawMaterial: '',
        purchased: '',
        used: ''
      });
      setClerkName('');
      setFormError(false);
      setClerkNameError(false);

      // Close add item modal and show success modal
      toggleSaveModal();
      toggleConfirmationModal();

    } catch (error) {
      console.error("Error adding item:", error);
      setFormError(true);
    }
  };

  // Validate raw material name - only allow letters and spaces
  const validateRawMaterialName = (name) => {
    // Regular expression to match only letters and spaces
    const letterOnlyRegex = /^[A-Za-z\s]+$/;
    return letterOnlyRegex.test(name);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special validation for raw material name
    if (name === 'rawMaterial') {
      // Allow empty value (for initial state)
      if (value === '') {
        setRawMaterialError('');
        setFormInputs(prev => ({
          ...prev,
          [name]: value
        }));
        return;
      }

      // Check if the input contains only letters and spaces
      if (!validateRawMaterialName(value)) {
        setRawMaterialError('Item name can only contain letters (no numbers or special characters)');
        return;
      } else {
        setRawMaterialError('');
      }
    }

    setFormInputs(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (formError) setFormError(false);
  };

  const inventoryNavLinks = [
    { path: "/inventory/daily-inventory", label: "Daily Inventory" },
    { path: "/inventory/saved-history", label: "Saved History" },
  ];

  const actionButton = {
    icon: IoMdAddCircleOutline,
    label: "Add Item",
    onClick: toggleSaveModal,
    className: "flex items-center gap-2 bg-[#FFCF50] hover:bg-[#e6bb48] text-black px-4 py-2 rounded-full font-medium text-sm transition-all duration-200",
    iconClassName: "size-4",
    tooltipText: "Add Item"
  };

  return (
    <>
      {/* Add Item Modal */}
      {saveModal && (
        <AnimatePresence>
          <motion.div
            className="h-screen w-screen bg-black/40 backdrop-blur-[2px] flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[32rem] rounded-3xl font-lato shadow-2xl"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full flex items-center justify-between p-6">
                <h2 className="text-2xl font-bold text-black">Add Item</h2>
                <button
                  className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                  onClick={toggleSaveModal}
                >
                  <X className="size-5 text-gray-400"/>
                </button>
              </div>

              <form className="flex flex-col space-y-6 px-6 pb-6" onSubmit={handleAddItem}>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Raw Materials</label>
                  <input
                    type="text"
                    name="rawMaterial"
                    value={formInputs.rawMaterial}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border ${(formError && !formInputs.rawMaterial) || rawMaterialError ? 'border-red-500' : 'border-gray-200'} rounded-2xl text-sm focus:border-[#FFCF50] focus:ring-2 focus:ring-[#FFCF50]/20 transition-all outline-none placeholder:text-gray-400`}
                    placeholder="Enter raw material name (letters only)"
                    required
                  />
                  {rawMaterialError && (
                    <p className="text-red-500 text-xs mt-1">{rawMaterialError}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Purchased (g)</label>
                    <input
                      type="number"
                      name="purchased"
                      value={formInputs.purchased}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border ${formError && !formInputs.purchased ? 'border-red-500' : 'border-gray-200'} rounded-2xl text-sm focus:border-[#FFCF50] focus:ring-2 focus:ring-[#FFCF50]/20 transition-all outline-none placeholder:text-gray-400`}
                      placeholder="Enter amount"
                      required
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Processed/Used (g) <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      name="used"
                      value={formInputs.used}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-[#FFCF50] focus:ring-2 focus:ring-[#FFCF50]/20 transition-all outline-none placeholder:text-gray-400`}
                      placeholder="Enter amount"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Clerk Name</label>
                  <input
                    type="text"
                    name="clerkName"
                    value={clerkName}
                    onChange={(e) => setClerkName(e.target.value)}
                    className={`w-full px-4 py-3 border ${clerkNameError ? 'border-red-500' : 'border-gray-200'} rounded-2xl text-sm focus:border-[#FFCF50] focus:ring-2 focus:ring-[#FFCF50]/20 transition-all outline-none placeholder:text-gray-400`}
                    placeholder="Enter clerk name"
                    required
                  />
                </div>

                {formError && (
                  <p className="text-red-500 text-sm">Please fill in all fields</p>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="bg-[#FFCF50] text-black px-8 py-3 rounded-2xl font-medium text-sm hover:bg-[#e6bb48] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={formError || !!rawMaterialError}
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ItemAddedModal */}
      {ItemAddedModal && (
        <AnimatePresence>
          <motion.div
            className="h-screen w-screen bg-black/25 backdrop-blur-[2px] flex justify-center items-center fixed top-0 left-0 bottom-0 right-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <motion.div
              className="bg-white h-auto w-[20rem] rounded-3xl font-lato shadow-2xl"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-full rounded-t-3xl flex items-center justify-end text-gray-500 p-3">
                <button
                  onClick={toggleConfirmationModal}
                  className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex w-full justify-center items-center flex-col pb-8 space-y-4">
                <FaCheckCircle className="size-14 text-[#0cd742]" />
                <h3 className="font-bold text-2xl pt-1 text-center">
                  Item Successfully<br/> Added!
                </h3>
                <span className="text-[.8rem] text-center justify-center text-gray-500">
                  Your item has been successfully<br/> added to the inventory!
                </span>
                <button
                  onClick={() => {
                    toggleConfirmationModal();
                    navigate('/inventory/daily-inventory');
                  }}
                  className="bg-[#0cd742] hover:bg-[#0bb93a] text-white px-8 py-2.5 rounded-2xl text-sm font-medium transition-colors mt-2"
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
        actionButton={actionButton}
      />
    </>
  );
};

export default InventoryNav;