import React, { useState, useEffect, useCallback } from "react";
import firebaseApp from "../../../firebaseConfig";
import { getFirestore, collection, getDocs, doc, writeBatch, onSnapshot, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle } from 'react-icons/fa';
import { X, ChevronUp, ChevronDown, Edit2 } from 'lucide-react';

const InventoryDaily = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clerkName, setClerkName] = useState('');
  const [editedItems, setEditedItems] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [order, setOrder] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const db = getFirestore(firebaseApp);

  // Add this validation function after your existing state declarations
  const validateInventoryChange = (item, newValues) => {
    // Use ending inventory as the available stock
    const availableStock = Number(item.ending_inv || 0);
    const requestedUse = Number(newValues.used || 0);
    const requestedWaste = Number(newValues.waste || 0);
    const totalRequest = requestedUse + requestedWaste;
  
    if (totalRequest > availableStock) {
      return {
        isValid: false,
        message: `Insufficient stock. Available: ${availableStock}g, Requested: ${totalRequest}g`
      };
    }
    return { isValid: true };
  };

  // Update the isNewDay function to handle both Date and Timestamp objects
  const isNewDay = (lastUpdated) => {
    if (!lastUpdated) return true;
    
    // Convert to Date object if it's a Firestore timestamp
    const lastUpdate = lastUpdated.toDate ? lastUpdated.toDate() : new Date(lastUpdated);
    const today = new Date();
    
    return lastUpdate.getDate() !== today.getDate() ||
           lastUpdate.getMonth() !== today.getMonth() ||  
           lastUpdate.getFullYear() !== today.getFullYear();
  };

  // Replace fetchInventoryData with real-time listener
  useEffect(() => {
    setLoading(true);
    
    // Create real-time listener
    const unsubscribe = onSnapshot(collection(db, "inventory"), (snapshot) => {
      const updates = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        
        if (isNewDay(data.last_updated)) {
          const newData = {
            begin_inv: data.ending_inv || 0,
            ending_inv: null,
            purchased: 0,
            used: 0,
            waste: 0,
            last_updated: new Date(),
            stock_status: 'Pending',
            raw_mats: data.raw_mats
          };
          updates.push({ id: doc.id, ...newData });
        } else {
          updates.push({ id: doc.id, ...data });
        }
      });

      setInventoryData(updates);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory data:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [db]); // Only depend on db instance

  // Update the getStockStatus function to consider hidden ending inventory
  const getStockStatus = (endingInventory, item) => {
    // If ending_inv is null but we have a previous value, use that for status
    if (endingInventory === null) {
      // Use the previous ending inventory that's now in begin_inv
      const actualInventory = Number(item.begin_inv || 0);
      if (actualInventory >= 5000) return 'High';
      if (actualInventory >= 3000) return 'Moderate';
      return 'Low';
    }
    
    const inventory = Number(endingInventory);
    if (inventory >= 5000) return 'High';
    if (inventory >= 3000) return 'Moderate';
    return 'Low';
  };

  // Update the calculateInventory function
  const calculateInventory = (item, newValues) => {
    // Convert all values to numbers, defaulting to 0 if not provided
    const purchased = Number(newValues.purchased || 0);
    const used = Number(newValues.used || 0);
    const waste = Number(newValues.waste || 0);
    
    // Keep the original beginning inventory
    const beginningInventory = item.begin_inv;
    
    // Start with current ending inventory, not beginning inventory
    const currentEnding = item.ending_inv || beginningInventory;
    
    // Add purchases to current ending inventory
    const totalAvailable = currentEnding + purchased;
    
    // Subtract used and waste from total available
    const endingInventory = totalAvailable - used - waste;
    const finalEndingInventory = Math.max(0, endingInventory);
    
    console.log('Inventory Calculation:', {
      beginningInventory,
      currentEnding,
      purchased,
      totalAvailable,
      used,
      waste,
      finalEndingInventory
    });
    
    return {
      begin_inv: beginningInventory, // Keep original beginning inventory
      ending_inv: finalEndingInventory,
      purchased,
      used,
      waste,
      last_updated: new Date(),
      stock_status: getStockStatus(finalEndingInventory, item)
    };
  };

  // Add new state for error modal
  const [errorModal, setErrorModal] = useState({
    show: false,
    message: '',
    item: ''
  });

  // Update the handleInputChange function to handle default waste value and use custom error modal
  const handleInputChange = (itemId, field, value) => {
    const finalValue = field === 'waste' && value === '' ? '0' : value;
    
    // Create new edited values
    const newEditedValues = {
      ...editedItems[itemId],
      [field]: finalValue
    };

    // Validate if this is a 'used' or 'waste' change
    if (field === 'used' || field === 'waste') {
      const item = inventoryData.find(i => i.id === itemId);
      const validation = validateInventoryChange(item, newEditedValues);
      
      if (!validation.isValid) {
        setErrorModal({
          show: true,
          message: validation.message,
          item: item.raw_mats
        });
        return;
      }
    }
    
    setEditedItems(prev => ({
      ...prev,
      [itemId]: newEditedValues
    }));
  };

  // Update the handleSubmit function
  const handleSubmit = useCallback(async () => {
    try {
      if (!clerkName.trim()) {
        alert('Please enter clerk name for audit purposes');
        return;
      }

      // Validate all changes before proceeding
      for (const item of inventoryData) {
        const newValues = editedItems[item.id] || {};
        const validation = validateInventoryChange(item, newValues);
        
        if (!validation.isValid) {
          alert(`Error for ${item.raw_mats}: ${validation.message}`);
          return;
        }
      }

      setLoading(true);
      const batch = writeBatch(db);
      const timestamp = new Date();

      // Process all updates in one go
      const updates = inventoryData.map(item => {
        const itemRef = doc(db, 'inventory', item.id);
        const newValues = editedItems[item.id] || {};
        const calculatedValues = calculateInventory(item, newValues);
        
        // Create previous values object with default values
        const previousValues = {
          begin_inv: item.begin_inv || 0,
          ending_inv: item.ending_inv || 0,
          purchased: item.purchased || 0,
          used: item.used || 0,
          waste: item.waste || 0
        };

        const updateData = {
          ...calculatedValues,
          raw_mats: item.raw_mats, // Preserve the raw materials name
          last_updated: timestamp,
          clerk_name: clerkName,
          audit_trail: {
            updated_at: timestamp,
            updated_by: clerkName,
            previous_values: previousValues
          }
        };

        batch.update(itemRef, updateData);

        return {
          id: item.id,
          ...updateData // Include all fields including raw_mats
        };
      });

      await batch.commit();
      
      // Update state without refetching
      setInventoryData(updates);
      setEditedItems({});
      setClerkName('');
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Auto hide after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000); // Changed to 3000ms (3 seconds)

    } catch (error) {
      console.error('Error updating inventory:', error);
      alert('Failed to update inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [clerkName, editedItems, inventoryData, db]);

  // Add this helper function to check if an item has been edited
  const hasEdits = (itemId, editedItems) => {
    const edits = editedItems[itemId] || {};
    return Boolean(edits.purchased || edits.used || edits.waste);
  };

  const handleReorder = (currentIndex, direction) => {
    const newOrder = [...inventoryData];
    if (direction === 'up' && currentIndex > 0) {
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
    } else if (direction === 'down' && currentIndex < newOrder.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    }
    setInventoryData(newOrder);
  };

  const handleRawMaterialUpdate = async (itemId, newName) => {
    try {
      const itemRef = doc(db, 'inventory', itemId);
      await updateDoc(itemRef, {
        raw_mats: newName
      });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating raw material:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    );
  }

  // Add missing return statement with original design
  return (
    <>
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white h-auto w-[20rem] rounded-3xl font-lato shadow-2xl"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full rounded-t-3xl flex items-center justify-end text-gray-500 p-3">
                <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center p-6 pt-0 space-y-4 pb-8">
                <FaCheckCircle className="text-[#0CD742] text-5xl" />
                <h3 className="text-2xl font-bold text-center">
                  Inventory Successfully<br/>Updated!
                </h3>
                <p className="text-gray-500 text-sm text-center">
                  Your inventory has been successfully<br/>updated and saved.
                </p>
                <motion.div 
                  className="h-1 bg-[#0CD742] rounded-full w-full mt-4"
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Modal */}
      <AnimatePresence>
        {errorModal.show && (
          <motion.div
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[24rem] rounded-3xl font-lato shadow-2xl"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-full rounded-t-3xl flex items-center justify-between p-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Stock Alert
                </h3>
                <button 
                  onClick={() => setErrorModal({ show: false, message: '', item: '' })}
                  className="hover:bg-gray-100 p-2 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-col items-center justify-center px-6 pb-8 space-y-6">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                    <X className="size-10 text-red-500" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold text-red-600">
                    Insufficient Stock for
                  </p>
                  <p className="text-gray-900 font-bold text-xl">
                    {errorModal.item}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    {errorModal.message}
                  </p>
                </div>
                <button
                  onClick={() => setErrorModal({ show: false, message: '', item: '' })}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 
                    text-white px-10 py-3 rounded-2xl text-sm font-medium transition-all duration-300
                    shadow-lg hover:shadow-red-200 active:scale-95"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="bg-white rounded-2xl shadow-feat w-[1180px] mx-auto my-4 px-4">
        <div className="w-full overflow-x-auto">
          <div className="flex items-center text-[1.28rem] tracking-tight font-bold py-3 px-4 font-latrue border-b-[0.5px] min-w-max justify-around">
            <div className="w-[30px] min-w-[30px]"></div> {/* Spacer for reorder buttons */}
            <div className="w-[180px] min-w-[180px]">Raw Materials</div>
            <div className="w-[100px] min-w-[100px] text-center pl-2">Purchased</div>
            <div className="w-[100px] min-w-[100px] text-center pl-2">Processed<br />/Used</div>
            <div className="w-[100px] min-w-[100px] text-center pl-2">Waste</div>
            <div className="w-[100px] min-w-[100px] pl-2 text-center">Beginning Inventory</div>
            <div className="w-[100px] min-w-[100px] pl-4 text-center">Ending Inventory</div>
            <div className="w-[140px] min-w-[140px] text-center pl-2">Status</div>
          </div>

          {/* Map through inventory data from Firebase */}
          {inventoryData.map((item, index) => {
            // Get status based on actual inventory level, even if hidden
            const currentStatus = getStockStatus(item.ending_inv, item);
            const itemEdited = hasEdits(item.id, editedItems);
            
            return (
              <div
                key={item.id}
                className="flex justify-evenly items-center text-[1.15rem] font-latrue hover:bg-gray-50 mb-1 py-3 min-w-max border-b border-gray-100"
              >
                {/* Replace reorder buttons with edit button */}
                <div className="flex items-center justify-center w-[30px] min-w-[30px]">
                  <button
                    onClick={() => setEditingId(item.id)}
                    className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-600"
                  >
                    <Edit2 className="size-4" />
                  </button>
                </div>

                {/* Raw Materials - with edit functionality */}
                <div className="flex items-center w-[180px] min-w-[180px]">
                  {editingId === item.id ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        const newName = e.target.rawMaterial.value;
                        handleRawMaterialUpdate(item.id, newName);
                      }}
                      className="flex w-full"
                    >
                      <input
                        type="text"
                        name="rawMaterial"
                        defaultValue={item.raw_mats}
                        className="bg-white text-sm text-gray-700 w-full h-9 px-3
                          rounded-lg border-2 border-amber-400
                          focus:outline-none focus:ring-2 focus:ring-amber-200
                          transition-all duration-200"
                        autoFocus
                        onBlur={(e) => {
                          handleRawMaterialUpdate(item.id, e.target.value);
                        }}
                      />
                    </form>
                  ) : (
                    <span className="truncate font-medium text-gray-700">{item.raw_mats}</span>
                  )}
                </div>

                {/* Purchased - Editable */}
                <div className="flex justify-center w-[100px] min-w-[100px]">
                  <input
                    type="number"
                    value={editedItems[item.id]?.purchased || ''}
                    onChange={(e) => handleInputChange(item.id, 'purchased', e.target.value)}
                    className="bg-white text-sm text-gray-700 w-32 h-9 px-3 text-center 
                      rounded-lg border border-gray-300
                      focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200
                      hover:border-amber-300 transition-all duration-200
                      shadow-sm"
                    placeholder="Enter amount (g)"
                    required
                    min="0"
                  />
                </div>

                {/* Processed/Used - Editable */}
                <div className="flex justify-center w-[100px] min-w-[100px]">
                  <input
                    type="number"
                    value={editedItems[item.id]?.used || ''}
                    onChange={(e) => handleInputChange(item.id, 'used', e.target.value)}
                    className="bg-white text-sm text-gray-700 w-32 h-9 px-3 text-center 
                      rounded-lg border border-gray-300
                      focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200
                      hover:border-amber-300 transition-all duration-200
                      shadow-sm"
                    placeholder="Enter amount (g)"
                    required
                    min="0"
                  />
                </div>

                {/* Waste - Editable with default 0 */}
                <div className="flex justify-center w-[100px] min-w-[100px]">
                  <input
                    type="number"
                    value={editedItems[item.id]?.waste || '0'}
                    onChange={(e) => handleInputChange(item.id, 'waste', e.target.value)}
                    className="bg-white text-sm text-gray-700 w-32 h-9 px-3 text-center 
                      rounded-lg border border-gray-300
                      focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200
                      hover:border-amber-300 transition-all duration-200
                      shadow-sm"
                    placeholder="0"
                    required
                    min="0"
                  />
                </div>

                {/* Beginning Inventory - Read Only with distinct styling */}
                <div className="flex justify-center w-[100px] min-w-[100px]">
                  <input
                    type="text"
                    value={item.begin_inv !== undefined ? item.begin_inv : '0'}
                    className="bg-gray-100 border border-gray-200 text-sm text-gray-600 rounded-lg w-28 h-9 px-3 text-center cursor-not-allowed opacity-80"
                    readOnly
                  />
                </div>

                {/* Ending Inventory - Only show if edited or has existing value */}
                <div className="flex justify-center w-[100px] min-w-[100px]">
                  <input
                    type="text"
                    value={
                      isNewDay(item.last_updated) || item.ending_inv === null
                        ? '—'  // Show dash for new day or null ending inventory
                        : (item.ending_inv || '0')
                    }
                    className={`bg-gray-100 border border-gray-200 text-sm text-gray-600 rounded-lg w-28 h-9 px-3 text-center cursor-not-allowed 
                      ${(isNewDay(item.last_updated) || item.ending_inv === null) ? 'italic' : ''}`}
                    readOnly
                  />
                </div>

                {/* Status - Show actual status even when ending inventory is hidden */}
                <div className="flex justify-center w-[120px] min-w-[120px]">
                  <div
                    className={`flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-medium
                      ${currentStatus === 'High'
                        ? 'bg-[#0CD742] text-green-800 border-[#067a25]'
                        : currentStatus === 'Moderate'
                          ? 'bg-[#FFCF50] text-amber-800 border-[#B3861A]'
                          : 'bg-[#FF3434] text-red-800 border-[#B82323]'
                      }`}
                  >
                    {currentStatus}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 pb-10 pt-5 p-5">
          <div className="flex items-center -ml-6">
            <h2 className="font-lato font-medium ml-3">Clerk Name:</h2>
            <input
              type="text"
              value={clerkName}
              onChange={(e) => setClerkName(e.target.value)}
              className="bg-gray-50 ml-2 border border-gray-500 text-sm text-gray-900 rounded-lg w-60 h-9 px-3
                focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all duration-200"
              placeholder="Type clerk name *"
              required
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-white border border-gray-300 font-medium font-lato text-sm w-28 h-9 
                hover:bg-gray-100 rounded-2xl ml-3 shadow-[0_5px_5px_rgba(0,0,0,0.3)] cursor-pointer"
            >
              Submit
            </button>
          </div>

          <div className="flex items-center justify-end">
            <div className="flex items-center mr-4">
              <span className="bg-[#0CD742] border border-[#067a25] rounded-full w-4 h-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)] mr-1"></span>
              <h2 className="font-lato italic opacity-60 text-sm leading-tight">
                High on
                <br /> Stocks
              </h2>
            </div>

            <div className="flex items-center mr-4">
              <span className="bg-[#FFCF50] border border-[#B3861A] rounded-full w-4 h-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)] mr-1"></span>
              <h2 className="font-lato italic opacity-60 text-sm leading-tight">
                Moderate Stock
                <br /> Level
              </h2>
            </div>

            <div className="flex items-center">
              <span className="bg-[#FF3434] border border-[#B82323] rounded-full w-4 h-4 shadow-[inset_0_5px_5px_rgba(0,0,0,0.2)] mr-1"></span>
              <h2 className="font-lato italic opacity-60 text-sm leading-tight">
                Low on
                <br /> Stocks
              </h2>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default InventoryDaily;
