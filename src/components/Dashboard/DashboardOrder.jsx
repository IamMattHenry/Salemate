import React, { useState, useEffect } from "react";
import { Clock, Calendar } from "lucide-react";
import { MdCancel, MdDelete } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { FiAlertCircle } from "react-icons/fi";
import useNameModal from "../../hooks/Modal/EnterNameModal";
import useConfirmOrderModal from "../../hooks/Modal/ConfirmOrderModal";
import useSuccessModal from "../../hooks/Modal/SuccessModal";
import useQRPaymentModal from "../../hooks/Modal/QRPaymentModal";
import QRPaymentModal from "../Dashboard/QRPaymentModal";
import { AnimatePresence, motion } from "framer-motion";
import { collection, addDoc, serverTimestamp, getFirestore, query, where, getDocs, orderBy, updateDoc, doc, getDoc } from "firebase/firestore";
import firebaseApp from "../../firebaseConfig";

const DashboardOrder = ({ product, orderList, setOrderList }) => {
  const [orderNumber, setOrderNumber] = useState(1);
  const [quantities, setQuantities] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [nameError, setNameError] = useState("");
  const [idError,   setIdError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Initialize Firestore
  const db = getFirestore(firebaseApp);

  // Import custom hooks
  const { inputNameModal, showNameModal, toggleModal } = useNameModal();
  const { confirmOrderModal, showConfirmOrderModal, toggleConfirmOrderModal } = useConfirmOrderModal();
  const { okayModal, showSuccessModal } = useSuccessModal();
  const { qrPaymentModal, showQRPaymentModal, hideQRPaymentModal } = useQRPaymentModal();

  // Get current date and time
  const dateToday = new Date();
  const timeToday = dateToday.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDate = dateToday.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // For backward compatibility with old implementation
  const [quantity, setQuantity] = useState(1);

  // Initialize quantities based on the orderList length and quantity
  useEffect(() => {
    if (orderList && orderList.length > 0) {
      // Use product quantities if they exist, otherwise default to 1
      setQuantities(orderList.map(item => item.quantity || 1));
    } else {
      setQuantities([]);
    }
  }, [orderList]);

  // Get the next order number from Firebase for display purposes
  useEffect(() => {
    const getNextOrderNumber = async () => {
      try {
        // Get today's start timestamp (midnight)
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        // Query for orders created today only
        const orderQuery = query(
          collection(db, "order_transaction"),
          where("created_at", ">=", startOfDay), // Only get orders from today
          orderBy("created_at", "desc") // Sort by creation time
        );

        const orderSnapshot = await getDocs(orderQuery);

        // If no orders exist for today, start from 1
        if (orderSnapshot.empty) {
          setOrderNumber(1); // First order of the day
        } else {
          // Find the highest order number for today
          let maxOrderNum = 0;
          orderSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.order_id) {
              // Parse the order_id as a number
              const orderNum = parseInt(data.order_id) || 0;
              if (orderNum > maxOrderNum) {
                maxOrderNum = orderNum;
              }
            }
          });

          // Increment for the next order
          setOrderNumber(maxOrderNum + 1);
        }
      } catch (error) {
        console.error("Error getting latest order ID:", error);
        setOrderNumber(1); // Default to 1 if there's an error
      }
    };

    getNextOrderNumber();
  }, []);

  // Decrease quantity
  const decreaseQuantity = (index) => {
    if (orderList) {
      if (quantities[index] > 1) {
        const updatedQuantities = [...quantities];
        updatedQuantities[index] = quantities[index] - 1;
        setQuantities(updatedQuantities);

        // Also update the orderList quantities to keep them in sync
        if (setOrderList) {
          const updatedOrderList = [...orderList];
          updatedOrderList[index] = {
            ...updatedOrderList[index],
            quantity: quantities[index] - 1
          };
          setOrderList(updatedOrderList);
        }
      }
    } else if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Increase quantity
  const increaseQuantity = (index) => {
    if (orderList) {
      const updatedQuantities = [...quantities];
      updatedQuantities[index] = quantities[index] + 1;
      setQuantities(updatedQuantities);

      // Also update the orderList quantities to keep them in sync
      if (setOrderList) {
        const updatedOrderList = [...orderList];
        updatedOrderList[index] = {
          ...updatedOrderList[index],
          quantity: quantities[index] + 1
        };
        setOrderList(updatedOrderList);
      }
    } else {
      setQuantity(quantity + 1);
    }
  };

  // Recalculate total quantity and subtotal dynamically
  useEffect(() => {
    if (orderList && orderList.length > 0 && quantities.length === orderList.length) {
      const totalQty = quantities.reduce((a, b) => a + b, 0); // Sum of all quantities

      const totalSubtotal = orderList.reduce(
        (total, item, index) => {
          const price = parseFloat(item.price);
          return total + price * quantities[index];
        },
        0
      );

      setTotalQuantity(totalQty); // Update total quantity
      setSubtotal(totalSubtotal); // Update subtotal
    } else {
      setTotalQuantity(0);
      setSubtotal(0);
    }
  }, [quantities, orderList]);

  // Function to clear all orders if needed
  const clearAllOrders = () => {
    if (setOrderList) {
      setOrderList([]); // Clears the entire order list
      setQuantities([]); // Resets quantities
      setTotalQuantity(0); // Resets total quantity
      setSubtotal(0); // Resets subtotal
    }
  };

  // Function to remove a specific product - triggered by the red "X" icon
  const removeItem = (index) => {
    console.log(`Removing item at index: ${index}`);
    if (orderList && setOrderList) {
      const updatedOrderList = orderList.filter((_, i) => i !== index); // Remove the product at the given index
      const updatedQuantities = quantities.filter((_, i) => i !== index); // Remove the corresponding quantity

      setOrderList(updatedOrderList); // Update the order list
      setQuantities(updatedQuantities); // Update the quantities
    }
  };

  // Check document size to ensure it doesn't exceed 32KB
  const estimateDocumentSize = (obj) => {
    // Convert object to JSON string and measure its size in bytes
    const jsonString = JSON.stringify(obj);
    // UTF-16 characters can take up to 4 bytes each in the worst case
    // This is a conservative estimate
    return jsonString.length * 4;
  };

  // Save order to Firebase
  const saveOrderToFirebase = async () => {
    try {
      console.log("Saving order to Firebase...");

      // Get all product names for the order name (for table display)
      let orderName = "Unknown Order";
      if (orderList && orderList.length > 0) {
        // Create an array of product names and join them with " / "
        orderName = orderList
          .map(item => item.title)
          .join(" / ");
      }

      // Prepare order items with correct data types and exact format
      // Remove URL completely to reduce document size
      const orderItems = orderList.map((item, index) => {
        const price = parseFloat(item.price);
        const qty = quantities[index];
        return {
          category: item.category,
          description: item.description,
          id: item.id,
          price: price,
          quantity: qty,
          title: item.title,
          // Don't include the URL at all - we'll use the product ID to reference the image if needed
          imageRef: item.id // Using the product ID as a reference to the image
        };
      });

      // Calculate final total
      const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create the order document to check its size
      const orderDoc = {
        created_at: new Date(), // Use a regular Date for size estimation
        customer_id: studentId,
        items: orderItems,
        mop: paymentMode,
        no_order: totalQuantity,
        order_date: new Date(), // Use a regular Date for size estimation
        order_name: orderName,
        order_status: "Preparing",
        order_time: timeToday,
        order_total: orderTotal,
        recipient: customerName,
        status: true,
        updated_at: new Date(), // Use a regular Date for size estimation
        order_id: "1", // Placeholder for size estimation
        reference_number: paymentMode === "Online" ? "" : null // Include reference_number field in size estimation
      };

      // Check if the document size exceeds 32KB (32,768 bytes)
      const docSize = estimateDocumentSize(orderDoc);
      console.log(`Estimated document size: ${docSize} bytes`);

      if (docSize > 32768) {
        console.warn("Document size exceeds 32KB limit. Trimming description fields...");

        // Trim description fields to reduce size
        orderItems.forEach(item => {
          if (item.description && item.description.length > 50) {
            item.description = item.description.substring(0, 50) + "...";
          }
        });

        // Check size again after trimming
        orderDoc.items = orderItems;
        const newSize = estimateDocumentSize(orderDoc);
        console.log(`New estimated document size after trimming: ${newSize} bytes`);

        if (newSize > 32768) {
          console.error("Document still exceeds 32KB limit after trimming");
          alert("Order data is too large. Please reduce the number of items or try again.");
          return false;
        }
      }

      // Get the highest order_id from existing orders created TODAY
      let nextOrderId = 1; // Default to 1 if no orders exist for today
      try {
        // Get today's start timestamp (midnight)
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);

        // Query for orders created today only
        const orderQuery = query(
          collection(db, "order_transaction"),
          where("created_at", ">=", startOfDay), // Only get orders from today
          orderBy("created_at", "desc") // Sort by creation time
        );

        const orderSnapshot = await getDocs(orderQuery);

        // If no orders exist for today, start from 1
        if (orderSnapshot.empty) {
          nextOrderId = 1; // First order of the day
        } else {
          // Find the highest order number for today
          let maxOrderNum = 0;
          orderSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.order_id) {
              // Parse the order_id as a number
              const orderNum = parseInt(data.order_id) || 0;
              if (orderNum > maxOrderNum) {
                maxOrderNum = orderNum;
              }
            }
          });

          // Increment for the next order
          nextOrderId = maxOrderNum + 1;
        }
      } catch (error) {
        console.error("Error getting latest order ID:", error);
        // Continue with default nextOrderId = 1 if there's an error
      }

      // Convert to string for consistency
      const orderIdString = nextOrderId.toString();

      // Save to "order_transaction" collection with exact format as specified
      const orderTransactionRef = await addDoc(collection(db, "order_transaction"), {
        created_at: serverTimestamp(),
        customer_id: studentId,
        items: orderItems,
        mop: paymentMode,
        no_order: totalQuantity,
        order_date: serverTimestamp(),
        order_name: orderName,
        order_status: "Preparing",
        order_time: timeToday,
        order_total: orderTotal,
        recipient: customerName,
        status: true,
        updated_at: serverTimestamp(),
        order_id: orderIdString, // Add the incremental order_id
        reference_number: paymentMode === "Online" ? "" : null // Initialize reference_number field for online payments
      });

      console.log("Order saved to order_transaction:", orderTransactionRef.id);

      // Update "customer_history" collection
      const currentMonthYear = dateToday.toLocaleString("default", { month: "long", year: "numeric" });
      const customerHistoryRef = collection(db, "customer_history");

      // Check if customer history document would exceed size limit
      const customerHistoryDoc = {
        monthYear: currentMonthYear,
        totalItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        totalOrders: 1, // This is one order
        totalSpent: orderTotal,
        customerName: customerName,
        studentId: studentId,
        orderDate: formattedDate,
        orderTime: timeToday,
        customerCount: 1,
        dateSaved: new Date(), // Use regular Date for size estimation
        lastUpdated: new Date(), // Use regular Date for size estimation
        orderItems: orderItems,
        order_id: orderIdString,
        mop: paymentMode, // Include payment method
        reference_number: paymentMode === "Online" ? "" : null // Include reference_number field
      };

      const historySize = estimateDocumentSize(customerHistoryDoc);
      console.log(`Estimated customer history document size: ${historySize} bytes`);

      if (historySize > 32768) {
        console.warn("Customer history document exceeds 32KB limit. Simplifying order items...");

        // Create simplified order items with minimal information
        const simplifiedOrderItems = orderItems.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          category: item.category
          // Omit description and other large fields
        }));

        customerHistoryDoc.orderItems = simplifiedOrderItems;
      }

      const customerHistorySnapshot = await addDoc(customerHistoryRef, {
        monthYear: currentMonthYear,
        totalItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        totalOrders: 1, // This is one order
        totalSpent: orderTotal,
        customerName: customerName,
        studentId: studentId,
        orderDate: formattedDate,
        orderTime: timeToday,
        customerCount: 1,
        dateSaved: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        orderItems: customerHistoryDoc.orderItems, // Use potentially simplified items
        order_id: orderIdString, // Add the order_id to customer_history as well
        mop: paymentMode, // Include payment method
        reference_number: paymentMode === "Online" ? "" : null // Include reference_number field
      });

      console.log("Order saved to customer_history:", customerHistorySnapshot.id);
      return true;
    } catch (error) {
      console.error("Error saving order to Firebase:", error);
      return false;
    }
  };

  const handleCheckout = () => {
    console.log("Checkout clicked");
    if (orderList && orderList.length > 0) {
      showNameModal(); // Show name input modal first
    } else {
      console.log("Cannot checkout with empty order list");
    }
  };

  const handleCustomerNameChange = (e) => {
    setCustomerName(e.target.value);
    // Clear name error when user types
    if (nameError) setNameError("");
  };

  // Function to check if student ID already exists in the database
  // Returns true if ID exists but with a different name (is a duplicate)
  // Returns false if ID doesn't exist or if ID exists with the same name (allowed)
  const checkDuplicateId = async (id, name) => {
    try {
      const q = query(
        collection(db, "order_transaction"),
        where("customer_id", "==", id)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // ID doesn't exist, so it's not a duplicate
        return false;
      }

      // Check if any document has the same name
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        // If we find a match with the same name, it's not considered a duplicate
        if (data.recipient && data.recipient.trim().toLowerCase() === name.trim().toLowerCase()) {
          return false; // Not a duplicate if same name and ID
        }
      }

      // If we get here, the ID exists but with different names
      return true; // It's a duplicate
    } catch (error) {
      console.error("Error checking for duplicate ID:", error);
      return false; // Assume no duplicate in case of error
    }
  };

  // Validate form inputs
  const validateInputs = async () => {
    let isValid = true;

    // Reset errors
    setNameError("");
    setIdError("");

    // Validate name (required)
    if (!customerName.trim()) {
      setNameError("Customer name is required");
      isValid = false;
    }

    // Validate customer ID
    if (!studentId.trim()) {
      setIdError("Customer ID is required");
      isValid = false;
    } else if (studentId.length !== 6) {
      setIdError("Customer ID must be exactly 6 digits");
      isValid = false;
    } else if (!/^\d+$/.test(studentId)) {
      setIdError("Customer ID must contain only numbers");
      isValid = false;
    } else {
      // Check for duplicate ID with different name
      const isDuplicate = await checkDuplicateId(studentId, customerName);
      if (isDuplicate) {
        setIdError("This Customer ID is already in use with a different name");
        isValid = false;
      }
    }

    return isValid;
  };

  // Modified toggleModal function to reset form state
  const handleModalClose = () => {
    // Reset form state
    setCustomerName("");
    setStudentId("");
    setNameError("");
    setIdError("");
    setIsValidating(false);

    // Close the modal
    toggleModal();
  };

  const handleNameSubmit = async () => {
    setIsValidating(true);

    try {
      const isValid = await validateInputs();

      if (isValid) {
        console.log("Customer Name:", customerName);
        console.log("Student ID:", studentId);
        toggleModal(); // Hide the name modal

        setTimeout(() => {
          showConfirmOrderModal();
        }, 300);
      }
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };

  // Function to update or create monthly saved history
  const updateMonthlySavedHistory = async () => {
    try {
      const currentDate = new Date();
      const currentMonthYear = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      });

      // Check if a record for this month already exists
      const monthCheckQuery = query(
        collection(db, "saved_history"),
        orderBy("dateSaved", "desc")
      );

      const monthCheckSnapshot = await getDocs(monthCheckQuery);
      const existingRecord = monthCheckSnapshot.docs.find(doc => {
        const data = doc.data();
        if (!data.dateSaved) return false;

        const savedDate = new Date(data.dateSaved.seconds * 1000);
        return savedDate.getMonth() === currentDate.getMonth() &&
               savedDate.getFullYear() === currentDate.getFullYear();
      });

      // Get current month's transactions
      const transactionQuery = query(
        collection(db, "order_transaction"),
        orderBy("order_date", "desc")
      );

      const transactionSnapshot = await getDocs(transactionQuery);
      let currentTransactions = transactionSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(t => {
          if (!t.order_date) return false;
          const orderDate = new Date(t.order_date.seconds * 1000);
          return orderDate.getMonth() === currentDate.getMonth() &&
                 orderDate.getFullYear() === currentDate.getFullYear();
        });

      // Sort by order_id in ascending order
      currentTransactions = currentTransactions.sort((a, b) => {
        const orderIdA = parseInt(a.order_id) || 0;
        const orderIdB = parseInt(b.order_id) || 0;
        return orderIdA - orderIdB;
      });

      if (currentTransactions.length > 0) {
        // Make sure all transactions have the reference_number field
        currentTransactions = currentTransactions.map(transaction => {
          // If it's an online payment and doesn't have a reference_number field, add an empty string
          if (transaction.mop === "Online" && !transaction.hasOwnProperty('reference_number')) {
            return {
              ...transaction,
              reference_number: ""
            };
          }
          // If it's not an online payment and doesn't have a reference_number field, add null
          if (transaction.mop !== "Online" && !transaction.hasOwnProperty('reference_number')) {
            return {
              ...transaction,
              reference_number: null
            };
          }
          return transaction;
        });

        if (existingRecord) {
          // Update existing record
          await updateDoc(doc(db, "saved_history", existingRecord.id), {
            transactions: currentTransactions,
            lastUpdated: serverTimestamp()
          });
          console.log("Updated existing monthly saved history");
        } else {
          // Create new record
          await addDoc(collection(db, "saved_history"), {
            monthYear: currentMonthYear,
            transactions: currentTransactions,
            dateSaved: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
          console.log("Created new monthly saved history");
        }
      }
    } catch (error) {
      console.error("Error updating monthly saved history:", error);
    }
  };

  const handleConfirmOrder = async () => {
    toggleConfirmOrderModal(); // Hide confirmation modal

    // Save order to Firebase
    const saveResult = await saveOrderToFirebase();

    if (saveResult) {
      // Store the current subtotal and order number before resetting
      const currentSubtotal = subtotal;
      const currentOrderNumber = orderNumber;

      // Update the order number display to show the next order number
      const getNextOrderNumber = async () => {
        try {
          // Get today's start timestamp (midnight)
          const today = new Date();
          const startOfDay = new Date(today);
          startOfDay.setHours(0, 0, 0, 0);

          // Query for orders created today only
          const orderQuery = query(
            collection(db, "order_transaction"),
            where("created_at", ">=", startOfDay), // Only get orders from today
            orderBy("created_at", "desc") // Sort by creation time
          );

          const orderSnapshot = await getDocs(orderQuery);

          // If no orders exist for today, start from 1
          if (orderSnapshot.empty) {
            setOrderNumber(1); // First order of the day
          } else {
            // Find the highest order number for today
            let maxOrderNum = 0;
            orderSnapshot.docs.forEach(doc => {
              const data = doc.data();
              if (data.order_id) {
                // Parse the order_id as a number
                const orderNum = parseInt(data.order_id) || 0;
                if (orderNum > maxOrderNum) {
                  maxOrderNum = orderNum;
                }
              }
            });

            // Increment for the next order
            setOrderNumber(maxOrderNum + 1);
          }
        } catch (error) {
          console.error("Error getting latest order ID:", error);
        }
      };

      await getNextOrderNumber();

      // Update or create monthly saved history
      await updateMonthlySavedHistory();

      // Reset order lists
      if (setOrderList) {
        setOrderList([]);
        setQuantities([]);
        setTotalQuantity(0);
        setSubtotal(0);
      }

      // If payment mode is Online, show QR Payment Modal with stored values
      if (paymentMode === "Online") {
        // Use setTimeout to ensure state updates have completed
        setTimeout(() => {
          // Show QR Payment Modal with the stored subtotal
          const qrModalElement = document.createElement('div');
          document.body.appendChild(qrModalElement);

          // Show QR Payment Modal with correct values
          showQRPaymentModal();

          // Update QR Payment Modal props
          const qrPaymentModalProps = {
            orderNumber: currentOrderNumber - 1,
            totalAmount: currentSubtotal
          };

          // Pass the stored values to QRPaymentModal
          document.dispatchEvent(new CustomEvent('updateQRPaymentModal', {
            detail: qrPaymentModalProps
          }));
        }, 300);
      } else {
        // For Cash payments, show success modal directly
        setTimeout(() => {
          showSuccessModal();
        }, 300);
      }
    } else {
      alert("Failed to save order. Please try again.");
    }
  };

  // State for reference number
  const [referenceNumber, setReferenceNumber] = useState("");

  // Handle QR payment completion
  const handleQRPaymentComplete = async (referenceNumber) => {
    console.log("DashboardOrder - Received reference number:", referenceNumber);

    // Get the reference number from localStorage as a backup
    const storedRefNumber = localStorage.getItem('lastReferenceNumber');
    console.log("Reference number from localStorage:", storedRefNumber);

    // Use the passed reference number, or fall back to localStorage if it's invalid
    let finalRefNumber = referenceNumber;

    // Validate the reference number
    if (!finalRefNumber || typeof finalRefNumber !== 'string' || finalRefNumber.length !== 6 || !/^\d{6}$/.test(finalRefNumber)) {
      console.warn("Invalid reference number received:", finalRefNumber);

      // Try to use the stored reference number instead
      if (storedRefNumber && storedRefNumber.length === 6 && /^\d{6}$/.test(storedRefNumber)) {
        console.log("Using reference number from localStorage instead:", storedRefNumber);
        finalRefNumber = storedRefNumber;
      } else {
        console.error("No valid reference number available");
        alert("Invalid reference number. Please try again.");
        return;
      }
    }

    // Final check to ensure we have a valid reference number
    if (!finalRefNumber || finalRefNumber.length !== 6 || !/^\d{6}$/.test(finalRefNumber)) {
      console.error("Still no valid reference number. Aborting update.");
      alert("Invalid reference number. Please try again with a 6-digit number.");
      return;
    }

    console.log("Final reference number to be used:", finalRefNumber);
    hideQRPaymentModal(); // Hide QR payment modal

    // Update the latest order with the reference number
    try {
      // Get today's start timestamp (midnight)
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);

      console.log("Searching for order with ID:", (orderNumber - 1).toString());

      // Use a simpler query approach to avoid index requirements
      // First, just query by order_id without the date filter or ordering
      const orderQuery = query(
        collection(db, "order_transaction"),
        where("order_id", "==", (orderNumber - 1).toString())
      );

      try {
        const orderSnapshot = await getDocs(orderQuery);
        console.log("Found matching orders:", orderSnapshot.size);

        if (!orderSnapshot.empty) {
        // Get the first matching order
        const orderDoc = orderSnapshot.docs[0];
        console.log("Found order document:", orderDoc.id);

        // Use the validated reference number
        console.log("Using reference number for update:", finalRefNumber);

        // Update the order with the reference number
        try {
          const docRef = doc(db, "order_transaction", orderDoc.id);
          console.log("Updating document:", docRef.path);

          // DIRECT UPDATE: Set the reference_number field directly with the finalRefNumber
          await updateDoc(docRef, {
            reference_number: finalRefNumber,
            updated_at: serverTimestamp()
          });

          // Verify the update by fetching the document again
          const updatedDoc = await getDoc(docRef);
          const updatedData = updatedDoc.data();
          console.log("Updated document data:", updatedData);
          console.log("Saved reference_number:", updatedData.reference_number);

          // Double-check if the reference number was saved correctly
          if (updatedData.reference_number !== finalRefNumber) {
            console.error("Reference number mismatch! Expected:", finalRefNumber, "Got:", updatedData.reference_number);

            // Try one more time with a direct set operation
            await updateDoc(docRef, {
              reference_number: finalRefNumber
            });

            console.log("Attempted direct reference number update again");
          } else {
            console.log("Reference number verified successfully:", updatedData.reference_number);
          }

          console.log("Order successfully updated with reference number:", finalRefNumber);
        } catch (updateError) {
          console.error("Error during document update:", updateError);
          throw updateError; // Re-throw to be caught by the outer try-catch
        }

        // Also update the reference number in customer_history collection
        try {
          const orderData = orderDoc.data();
          console.log("Order data for customer history update:", orderData);

          const customerHistoryQuery = query(
            collection(db, "customer_history"),
            where("order_id", "==", orderData.order_id)
          );
          console.log("Searching for customer history with order_id:", orderData.order_id);

          const customerHistorySnapshot = await getDocs(customerHistoryQuery);
          console.log("Found customer history records:", customerHistorySnapshot.size);

          if (!customerHistorySnapshot.empty) {
            const customerHistoryDoc = customerHistorySnapshot.docs[0];
            console.log("Updating customer history document:", customerHistoryDoc.id);

            const customerHistoryRef = doc(db, "customer_history", customerHistoryDoc.id);
            await updateDoc(customerHistoryRef, {
              reference_number: finalRefNumber,
              lastUpdated: serverTimestamp()
            });

            // Verify the update
            const updatedHistoryDoc = await getDoc(customerHistoryRef);
            const updatedHistoryData = updatedHistoryDoc.data();
            console.log("Updated customer history reference_number:", updatedHistoryData.reference_number);

            console.log("Customer history successfully updated with reference number:", finalRefNumber);
          } else {
            console.log("No matching customer history record found for order_id:", orderData.order_id);
          }
        } catch (error) {
          console.error("Error updating customer_history with reference number:", error);
        }

        // Update the reference number in saved_history collection
        try {
          const currentDate = new Date();
          const currentMonthYear = currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          });
          console.log("Searching for saved history for month:", currentMonthYear);

          const savedHistoryQuery = query(
            collection(db, "saved_history"),
            where("monthYear", "==", currentMonthYear)
          );

          const savedHistorySnapshot = await getDocs(savedHistoryQuery);
          console.log("Found saved history records:", savedHistorySnapshot.size);

          if (!savedHistorySnapshot.empty) {
            const savedHistoryDoc = savedHistorySnapshot.docs[0];
            console.log("Found saved history document:", savedHistoryDoc.id);

            const savedHistoryData = savedHistoryDoc.data();

            if (savedHistoryData.transactions && Array.isArray(savedHistoryData.transactions)) {
              console.log("Number of transactions in saved history:", savedHistoryData.transactions.length);

              // Make sure orderData is defined
              if (!orderData) {
                console.error("orderData is undefined in saved_history update");
                return;
              }

              console.log("Looking for transaction with order_id:", orderData.order_id);

              // Find the transaction to update
              const transactionToUpdate = savedHistoryData.transactions.find(
                transaction => transaction.order_id === orderData.order_id
              );

              if (transactionToUpdate) {
                console.log("Found transaction to update:", transactionToUpdate);
                console.log("Current reference_number:", transactionToUpdate.reference_number);

                // Create updated transactions array
                const updatedTransactions = savedHistoryData.transactions.map(transaction => {
                  if (transaction.order_id === orderData.order_id) {
                    return {
                      ...transaction,
                      reference_number: finalRefNumber
                    };
                  }
                  return transaction;
                });

                const savedHistoryRef = doc(db, "saved_history", savedHistoryDoc.id);
                await updateDoc(savedHistoryRef, {
                  transactions: updatedTransactions,
                  lastUpdated: serverTimestamp()
                });

                console.log("Saved history successfully updated with reference number");
              } else {
                console.log("No matching transaction found in saved history for order_id:", orderData.order_id);
              }
            } else {
              console.log("No transactions array found in saved history document");
            }
          } else {
            console.log("No saved history found for current month");
          }
        } catch (error) {
          console.error("Error updating saved_history with reference number:", error);
        }
        }
      } catch (queryError) {
        console.error("Error querying for order:", queryError);

        // FALLBACK: Try a direct approach if the query fails due to indexing issues
        console.log("Attempting fallback approach with direct document update...");

        try {
          // Get all orders from today
          const allOrdersQuery = query(collection(db, "order_transaction"));
          const allOrdersSnapshot = await getDocs(allOrdersQuery);

          // Find the order with matching order_id manually
          const matchingOrders = allOrdersSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.order_id === (orderNumber - 1).toString();
          });

          console.log("Found matching orders through fallback:", matchingOrders.length);

          if (matchingOrders.length > 0) {
            // Use the first matching order
            const orderDoc = matchingOrders[0];
            console.log("Found order document through fallback:", orderDoc.id);

            // Get the order data
            const orderData = orderDoc.data();
            console.log("Order data from fallback:", orderData);

            // Update the order with the reference number
            const docRef = doc(db, "order_transaction", orderDoc.id);
            await updateDoc(docRef, {
              reference_number: finalRefNumber,
              updated_at: serverTimestamp()
            });

            console.log("Order successfully updated with reference number through fallback");

            // Also update customer_history and saved_history
            try {
              // Update customer_history
              const customerHistoryQuery = query(
                collection(db, "customer_history"),
                where("order_id", "==", orderData.order_id)
              );

              const customerHistorySnapshot = await getDocs(customerHistoryQuery);
              if (customerHistorySnapshot.size > 0) {
                const customerHistoryDoc = customerHistorySnapshot.docs[0];
                await updateDoc(doc(db, "customer_history", customerHistoryDoc.id), {
                  reference_number: finalRefNumber,
                  lastUpdated: serverTimestamp()
                });
                console.log("Customer history updated through fallback");
              }

              // Update saved_history
              const currentDate = new Date();
              const currentMonthYear = currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              });

              const savedHistoryQuery = query(
                collection(db, "saved_history"),
                where("monthYear", "==", currentMonthYear)
              );

              const savedHistorySnapshot = await getDocs(savedHistoryQuery);
              if (savedHistorySnapshot.size > 0) {
                const savedHistoryDoc = savedHistorySnapshot.docs[0];
                const savedHistoryData = savedHistoryDoc.data();

                if (savedHistoryData.transactions && Array.isArray(savedHistoryData.transactions)) {
                  // Find and update the transaction with matching order_id
                  const updatedTransactions = savedHistoryData.transactions.map(transaction => {
                    if (transaction.order_id === orderData.order_id) {
                      return {
                        ...transaction,
                        reference_number: finalRefNumber
                      };
                    }
                    return transaction;
                  });

                  await updateDoc(doc(db, "saved_history", savedHistoryDoc.id), {
                    transactions: updatedTransactions,
                    lastUpdated: serverTimestamp()
                  });
                  console.log("Saved history updated through fallback");
                }
              }
            } catch (updateError) {
              console.error("Error updating related collections in fallback:", updateError);
            }
          } else {
            console.error("No matching orders found through fallback approach");
          }
        } catch (fallbackError) {
          console.error("Error in fallback approach:", fallbackError);
        }
      }
    } catch (error) {
      console.error("Error updating order with reference number:", error);
    }

    setTimeout(() => {
      showSuccessModal(); // Show success modal
    }, 300);
  };

  const handleOrderComplete = () => {
    showSuccessModal(); // Toggle off the success modal

    // Reset input fields
    setCustomerName(""); // Clear customer name
    setStudentId(""); // Clear student ID
  };

  // Determine which items to display based on props
  const displayItems = orderList || (product ? [product] : []);

  return (
    <>
      {/* Main Order Section */}
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Section - Fixed height */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                Order #{orderNumber}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg">
                <Clock size={14} />
                <span>{timeToday}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg">
                <Calendar size={14} />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Payment Mode Section */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-600 mb-3">Mode of Payment</h4>
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMode("Cash")}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${
                    paymentMode === "Cash"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Cash
                </button>
                <button
                  onClick={() => setPaymentMode("Online")}
                  className={`px-6 py-2 rounded-xl font-medium transition-all ${
                    paymentMode === "Online"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Online
                </button>
              </div>
              <button
                onClick={clearAllOrders}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
              >
                <MdDelete size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Order Items Section - Scrollable with fixed height */}
        <div className="flex-1 overflow-y-auto p-6 h-[calc(100vh-350px)]">
          {displayItems.length > 0 ? (
            <div className="space-y-4">
              {displayItems.map((item, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-amber-50/50 transition-colors"
                >
                  {/* Display the image from the URL if available */}
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                    <p className="text-amber-600 font-medium mt-1">
                      ₱{parseFloat(item.price).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    {orderList && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(index);
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                          <MdCancel size={16} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => decreaseQuantity(index)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">
                        {quantities[index] || 1}
                      </span>
                      <button
                        onClick={() => increaseQuantity(index)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>No items in the order list</p>
            </div>
          )}
        </div>

        {/* Footer Section - Fixed height */}
        <div className="border-t border-gray-100 flex-shrink-0">
          <div className="p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Number of Products</span>
              <span className="font-medium text-gray-900">{totalQuantity}x</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold text-lg text-amber-600">
                ₱{subtotal.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={displayItems.length === 0}
              className={`
                w-full mt-4 py-3 rounded-xl font-medium transition-all
                ${displayItems.length > 0
                  ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }
              `}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {/* Customer Details Modal */}
      {inputNameModal && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleModalClose}
          >
            <motion.div
              className="bg-white w-[440px] rounded-2xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-8 py-6">
                <div className="flex items-center gap-5">
                  <div className="p-3.5 bg-emerald-100 rounded-xl">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Complete Order</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Enter customer details to proceed</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="px-8 py-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Juan Dela Cruz"
                    className={`w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2
                    ${nameError ? 'focus:ring-red-500/20 bg-red-50' : 'focus:ring-emerald-500/20'}
                    transition-all text-sm`}
                    value={customerName}
                    onChange={handleCustomerNameChange}
                  />
                  {nameError && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                      <FiAlertCircle size={14} />
                      <span>{nameError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Customer ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit ID"
                    maxLength={6}
                    className={`w-full px-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2
                    ${idError ? 'focus:ring-red-500/20 bg-red-50' : 'focus:ring-emerald-500/20'}
                    transition-all text-sm`}
                    value={studentId}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setStudentId(value);
                        if (idError) setIdError("");
                      }
                    }}
                    onKeyDown={(e) => {
                      // Allow only numbers, backspace, delete, tab, arrows
                      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
                      if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {idError && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                      <FiAlertCircle size={14} />
                      <span>{idError}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="px-8 py-5 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleModalClose}
                    className="px-4 py-2 text-gray-700 bg-white rounded-xl border border-gray-200
                             hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNameSubmit}
                    disabled={isValidating}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                      ${isValidating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
                      }
                    `}
                  >
                    {isValidating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Confirm Order Modal */}
      {confirmOrderModal && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[400px] rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="px-6 py-5 bg-emerald-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-400/30 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="font-semibold">Confirm Order</h3>
                  </div>
                  <button onClick={toggleConfirmOrderModal} className="p-1 hover:bg-emerald-400/30 rounded-lg transition-colors">
                    <MdCancel size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Order Details */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 px-4 bg-emerald-50 rounded-xl">
                    <span className="text-sm font-medium text-emerald-900">Order #{orderNumber}</span>
                    <span className="text-sm text-emerald-700">{paymentMode}</span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {displayItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        {/* Display the image from the URL if available */}
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500">
                              Qty: {quantities[index] || 1}
                            </span>
                            <span className="text-sm font-medium text-emerald-600">
                              ₱{parseFloat(item.price * (quantities[index] || 1)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-3 px-4 bg-emerald-50 rounded-xl">
                    <span className="font-medium text-emerald-900">Total Amount</span>
                    <span className="text-lg font-bold text-emerald-700">₱{subtotal.toFixed(2)}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex gap-3 text-sm">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg flex-1">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-600">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg flex-1">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-gray-600">{timeToday}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={handleConfirmOrder}
                  className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-medium
                           hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
                >
                  Confirm Order
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Success Modal */}
      {okayModal && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white w-[360px] rounded-2xl shadow-2xl overflow-hidden text-center p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <FaCheckCircle className="w-8 h-8 text-emerald-500" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Order Completed
                </h3>

                <p className="text-gray-500 mb-4">
                  Your order has been successfully placed
                </p>

                <div className="bg-emerald-50 px-4 py-2 rounded-lg mb-6">
                  <span className="text-sm font-medium text-emerald-800">
                    Order #{orderNumber - 1}
                  </span>
                </div>

                <button
                  onClick={handleOrderComplete}
                  className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-medium
                           hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/30"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* QR Payment Modal */}
      <QRPaymentModal
        isVisible={qrPaymentModal}
        onClose={hideQRPaymentModal}
        onComplete={handleQRPaymentComplete}
        orderNumber={orderNumber - 1}
        totalAmount={subtotal}
        paymentMethod="Online"
      />
    </>
  );
};

export default DashboardOrder;