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
import { collection, addDoc, serverTimestamp, getFirestore, query, where, getDocs, orderBy, updateDoc, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import firebaseApp from "../../firebaseConfig";
import customerService from "../../services/customerService";
import { useAuth } from "../../context/AuthContext";

// College and program data structure with program codes
const collegePrograms = {
  "College of Business Administration and Accountancy": [
    { code: "BSA", name: "Bachelor of Science in Accountancy (BSA)" },
    { code: "BS Entrep", name: "Bachelor of Science in Entrepreneurship (BS Entrep)" }
  ],
  "College of Education": [
    { code: "BECEd", name: "Bachelor of Early Childhood Education (BECEd)" }
  ],
  "College of Engineering": [
    { code: "IE", name: "Bachelor of Science in Industrial Engineering (IE)" },
    { code: "BSECE", name: "Bachelor of Science in Electronics Engineering (BSECE)" },
    { code: "BSCpE", name: "Bachelor of Science in Computer Engineering (BSCpE)" }
  ],
  "College of Computer Studies": [
    { code: "BSCS", name: "Bachelor of Science in Computer Science (BSCS)" },
    { code: "BSIT", name: "Bachelor of Science in Information Technology (BSIT)" },
    { code: "BSIS", name: "Bachelor of Science in Information System (BSIS)" }
  ]
};

const DashboardOrder = ({ product, orderList, setOrderList }) => {
  const [orderNumber, setOrderNumber] = useState(1);
  const [quantities, setQuantities] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [nameError, setNameError] = useState("");
  const [idError, setIdError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [customerSuffix, setCustomerSuffix] = useState("");
  const [lastGeneratedId, setLastGeneratedId] = useState(0);
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [showDisambiguationModal, setShowDisambiguationModal] = useState(false);
  const [customerVariants, setCustomerVariants] = useState([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [isStudentLocked, setIsStudentLocked] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programError, setProgramError] = useState("");
  const [editingQuantityIndex, setEditingQuantityIndex] = useState(-1); // Track which quantity is being edited
  const [showMaxOrderModal, setShowMaxOrderModal] = useState(false); // Modal for max order limit

  // Initialize Firestore
  const db = getFirestore(firebaseApp);

  // Get current user
  const { currentUser } = useAuth();

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
    fetchExistingCustomers();
  }, []);

  // Fetch existing customers and the last generated customer ID
  const fetchExistingCustomers = async () => {
    try {
      // Query all orders to get customer information
      const customersQuery = query(
        collection(db, "order_transaction"),
        orderBy("created_at", "desc")
      );

      const snapshot = await getDocs(customersQuery);
      const customers = [];
      const customerMap = new Map(); // Map to track customers by name for deduplication
      let maxCustomerId = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.recipient && data.customer_id) {
          // Convert customer ID to string once
          const customerIdStr = data.customer_id.toString();

          // Check if this is a non-student ID
          // For backward compatibility, handle both old format (starting with 'C') and new format (numeric only)
          if (customerIdStr.startsWith('C')) {
            // Old format: C followed by a number
            const idNumber = parseInt(customerIdStr.substring(1));
            if (idNumber > maxCustomerId) {
              maxCustomerId = idNumber;
            }
          } else if (!data.is_student && /^\d+$/.test(customerIdStr)) {
            // New format: just a number (for non-students)
            const idNumber = parseInt(customerIdStr);
            if (idNumber >= 500000 && idNumber > maxCustomerId) {
              maxCustomerId = idNumber;
            }
          }

          const customerName = data.recipient.toLowerCase();
          // Determine if this is a student based on the is_student flag or ID format
          // A customer is a student if:
          // 1. The is_student flag is explicitly true, OR
          // 2. The ID is not a number >= 500000 and doesn't start with 'C'
          let isStudentCustomer = false;

          // First check if we have an explicit is_student flag
          if (data.is_student !== undefined) {
            // Use the explicit flag if available
            isStudentCustomer = data.is_student === true;
            console.log(`Customer ${data.recipient} has explicit is_student flag: ${isStudentCustomer}`);
          } else if (customerIdStr.startsWith('C')) {
            // Old format non-student ID
            isStudentCustomer = false;
            console.log(`Customer ${data.recipient} has old format non-student ID: ${customerIdStr}`);
          } else if (/^\d+$/.test(customerIdStr)) {
            // Numeric ID - student if < 500000, non-student if >= 500000
            isStudentCustomer = parseInt(customerIdStr) < 500000;
            console.log(`Customer ${data.recipient} has numeric ID ${customerIdStr}, determined isStudent: ${isStudentCustomer}`);
          } else {
            // Non-numeric ID that doesn't start with 'C' - assume student
            isStudentCustomer = true;
            console.log(`Customer ${data.recipient} has non-standard ID ${customerIdStr}, assuming student`);
          }
          const orderDate = data.created_at ? new Date(data.created_at.seconds * 1000) : new Date();

          // Extract college and program information if available
          const college = data.college || null;
          const program_code = data.program_code || null;
          const program_full = data.program_full || null;

          // If we haven't seen this customer before, add them
          if (!customerMap.has(customerName)) {
            customerMap.set(customerName, {
              name: data.recipient,
              id: customerIdStr,
              isStudent: isStudentCustomer,
              lastOrder: orderDate,
              college: college,
              program_code: program_code,
              program_full: program_full,
              variants: [{
                id: customerIdStr,
                isStudent: isStudentCustomer,
                lastOrder: orderDate,
                college: college,
                program_code: program_code,
                program_full: program_full
              }]
            });
          } else {
            // If we've seen this customer before, check if this is a different ID
            const existingCustomer = customerMap.get(customerName);
            const existingVariant = existingCustomer.variants.find(v => v.id === customerIdStr);

            if (!existingVariant) {
              // This is a new variant of the same name
              existingCustomer.variants.push({
                id: customerIdStr,
                isStudent: isStudentCustomer,
                lastOrder: orderDate,
                college: college,
                program_code: program_code,
                program_full: program_full
              });

              // Update the "main" record if this order is more recent
              if (orderDate > existingCustomer.lastOrder) {
                existingCustomer.id = customerIdStr;
                existingCustomer.isStudent = isStudentCustomer;
                existingCustomer.lastOrder = orderDate;
                existingCustomer.college = college;
                existingCustomer.program_code = program_code;
                existingCustomer.program_full = program_full;
              }
            } else if (orderDate > existingVariant.lastOrder) {
              // Update the last order date for this variant
              existingVariant.lastOrder = orderDate;

              // Update college and program information if available
              if (college) existingVariant.college = college;
              if (program_code) existingVariant.program_code = program_code;
              if (program_full) existingVariant.program_full = program_full;

              // Update the "main" record if this order is more recent
              if (orderDate > existingCustomer.lastOrder) {
                existingCustomer.id = customerIdStr;
                existingCustomer.isStudent = isStudentCustomer;
                existingCustomer.lastOrder = orderDate;
                existingCustomer.college = college;
                existingCustomer.program_code = program_code;
                existingCustomer.program_full = program_full;
              }
            }
          }
        }
      });

      // Convert the map to an array
      customers.push(...customerMap.values());

      // Check if we have a customer_id_counter in the system_counters collection
      try {
        // Check if we have a local counter in localStorage
        const localCounter = localStorage.getItem('lastCustomerId');
        let localCounterValue = localCounter ? parseInt(localCounter) : 500000;

        // Use the higher of maxCustomerId and localCounterValue
        maxCustomerId = Math.max(maxCustomerId, localCounterValue);

        try {
          const counterRef = doc(db, "system_counters", "customer_id_counter");
          const counterDoc = await getDoc(counterRef);

          if (counterDoc.exists()) {
            const nextId = counterDoc.data().next_id;
            console.log(`Found customer ID counter in system_counters: ${nextId}`);

            // Use the highest value among all sources
            if (nextId > maxCustomerId) {
              maxCustomerId = nextId - 1; // Subtract 1 because next_id is the NEXT ID to use
            }

            // Update localStorage with the latest value
            localStorage.setItem('lastCustomerId', maxCustomerId.toString());
          } else {
            // If the counter doesn't exist yet, create it with the current max + 1
            // or 500001 if no customer IDs exist yet
            const startId = Math.max(maxCustomerId, 500000);
            try {
              await setDoc(counterRef, { next_id: startId + 1 });
              console.log(`Created customer ID counter starting at: ${startId + 1}`);

              // Update localStorage with the latest value
              localStorage.setItem('lastCustomerId', startId.toString());
            } catch (writeError) {
              console.warn("Could not create Firestore counter, but will continue with local counter:", writeError);

              // Update localStorage with the current max value
              localStorage.setItem('lastCustomerId', maxCustomerId.toString());
            }
          }
        } catch (firestoreError) {
          console.warn("Firestore access failed, using local counter:", firestoreError);

          // Update localStorage with the current max value
          localStorage.setItem('lastCustomerId', maxCustomerId.toString());
        }
      } catch (error) {
        console.error("Error checking customer ID counter:", error);

        // Ensure we have a reasonable value in maxCustomerId
        maxCustomerId = Math.max(maxCustomerId, 500000);
      }

      setExistingCustomers(customers);
      setLastGeneratedId(maxCustomerId);
      console.log(`Loaded ${customers.length} existing customers`);
      console.log(`Last generated customer ID: ${maxCustomerId}`);
    } catch (error) {
      console.error("Error fetching existing customers:", error);
    }
  };

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
      // Show modal if already at max limit of 30
      if (quantities[index] >= 30) {
        setShowMaxOrderModal(true);
        return;
      }

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
      // For single product mode, also respect the max limit
      if (quantity < 30) {
        setQuantity(quantity + 1);
      } else {
        setShowMaxOrderModal(true);
      }
    }
  };

  // Handle direct quantity input
  const handleQuantityChange = (index, value) => {
    // This function now only updates the value without exiting edit mode
    // Convert to number and ensure it's at least 1
    let newValue = parseInt(value);

    // If the input is not a valid number, default to 1
    if (isNaN(newValue) || newValue < 1) {
      newValue = 1;
    }

    // Enforce maximum order limit of 30
    if (newValue > 30) {
      newValue = 30;
      setShowMaxOrderModal(true);
    }

    if (orderList) {
      const updatedQuantities = [...quantities];
      updatedQuantities[index] = newValue;
      setQuantities(updatedQuantities);

      // Also update the orderList quantities to keep them in sync
      if (setOrderList) {
        const updatedOrderList = [...orderList];
        updatedOrderList[index] = {
          ...updatedOrderList[index],
          quantity: newValue
        };
        setOrderList(updatedOrderList);
      }
    }
  };

  // Function to finalize quantity input and exit edit mode
  const finalizeQuantityEdit = () => {
    setEditingQuantityIndex(-1);
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

  // Create a single global notification
  const createOrderNotification = async (orderIdString, customerName, orderTotal) => {
    try {
      console.log("Creating global notification for order");

      if (!currentUser) {
        console.error("Cannot create notification: No user is logged in");
        return;
      }

      // Create a single global notification with a special global flag
      const globalNotification = {
        type: 'order',
        message: `New order #${orderIdString} from ${customerName} (₱${orderTotal.toFixed(2)})`,
        severity: 'normal',
        route: '/orders/pending-transactions',
        module: 'orders',
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
      console.log(`Created global notification with ID: ${notificationRef.id}`);

    } catch (error) {
      console.error('Error creating global notification:', error);
      // Continue with order process even if notification fails
    }
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

      // Generate a customer ID for non-students if needed
      let finalCustomerId = studentId;

      if (!isStudent && (studentId === "Pending ID" || !studentId || studentId === '')) {
        // Generate a new customer ID for non-students
        try {
          const newCustomerId = await generateCustomerId();
          finalCustomerId = newCustomerId;
          setStudentId(newCustomerId);
          console.log(`Generated new customer ID for order: ${newCustomerId}`);
        } catch (error) {
          console.error("Error generating customer ID:", error);
          // Use a fallback ID if generation fails
          finalCustomerId = "500001"; // Default fallback
        }
      }

      // Create or update customer in the customers collection
      try {
        console.log("Creating or updating customer in customers collection");
        await customerService.createOrUpdateCustomer({
          name: customerName,
          customerId: finalCustomerId,
          isStudent: isStudent,
          orderTotal: orderTotal,
          college: isStudent ? selectedCollege : null,
          program_code: isStudent ? selectedProgram : null,
          program_full: isStudent && selectedCollege && selectedProgram ?
            collegePrograms[selectedCollege].find(p => p.code === selectedProgram)?.name : null
        });
        console.log("Customer record created/updated successfully");
      } catch (error) {
        console.error("Error creating/updating customer record:", error);
        // Continue with order creation even if customer record fails
      }

      // Save to "order_transaction" collection with exact format as specified
      const orderTransactionRef = await addDoc(collection(db, "order_transaction"), {
        created_at: serverTimestamp(),
        customer_id: finalCustomerId, // Use the generated or existing customer ID
        is_student: isStudent,
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
        reference_number: paymentMode === "Online" ? "" : null, // Initialize reference_number field for online payments
        college: isStudent ? selectedCollege : null, // Add college for students
        program_code: isStudent ? selectedProgram : null, // Add program code for students
        program_full: isStudent && selectedCollege && selectedProgram ?
          collegePrograms[selectedCollege].find(p => p.code === selectedProgram)?.name : null // Add full program name
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
        customer_id: finalCustomerId, // Use the generated or existing customer ID
        is_student: isStudent,
        orderDate: formattedDate,
        orderTime: timeToday,
        customerCount: 1,
        dateSaved: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        orderItems: customerHistoryDoc.orderItems, // Use potentially simplified items
        order_id: orderIdString, // Add the order_id to customer_history as well
        mop: paymentMode, // Include payment method
        reference_number: paymentMode === "Online" ? "" : null, // Include reference_number field
        college: isStudent ? selectedCollege : null, // Add college for students
        program_code: isStudent ? selectedProgram : null, // Add program code for students
        program_full: isStudent && selectedCollege && selectedProgram ?
          collegePrograms[selectedCollege].find(p => p.code === selectedProgram)?.name : null // Add full program name
      });

      console.log("Order saved to customer_history:", customerHistorySnapshot.id);

      // Add this customer to our existingCustomers list if they're new
      const existingCustomer = existingCustomers.find(
        c => c.name.toLowerCase() === customerName.toLowerCase()
      );

      if (!existingCustomer) {
        setExistingCustomers([
          ...existingCustomers,
          { name: customerName, id: finalCustomerId }
        ]);
        console.log(`Added new customer to existing customers list: ${customerName} (${finalCustomerId})`);
      }

      // Create a notification for the new order
      await createOrderNotification(orderIdString, customerName, orderTotal);

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
    // Only allow alphabetic characters, spaces, dots, and hyphens
    const value = e.target.value;

    // Allow only letters, spaces, dots, and hyphens
    // This regex allows for names with suffixes like "Jr.", "Sr.", "III", etc.
    if (/^[A-Za-z\s.\-]*$/.test(value) || value === '') {
      // If the name is being cleared or changed completely, reset the student lock
      if (value === '' || !value.toLowerCase().includes(customerName.toLowerCase())) {
        setIsStudentLocked(false);
        console.log("Resetting student type lock due to name change");
      }

      setCustomerName(value);

      // Check if this customer already exists
      if (value.trim() !== '') {
        const matchingCustomer = existingCustomers.find(
          c => c.name.toLowerCase() === value.toLowerCase()
        );

        if (matchingCustomer) {
          console.log(`Found existing customer: ${matchingCustomer.name} with ID: ${matchingCustomer.id}, isStudent: ${matchingCustomer.isStudent}`);

          // Check if this customer has multiple variants (same name, different IDs)
          if (matchingCustomer.variants && matchingCustomer.variants.length > 1) {
            // Set up the disambiguation modal
            setSelectedCustomerName(matchingCustomer.name);
            setCustomerVariants(matchingCustomer.variants);
            setShowDisambiguationModal(true);
          } else {
            // For non-students, we can automatically assign the ID
            if (matchingCustomer.isStudent === false ||
                (matchingCustomer.isStudent === undefined &&
                 (matchingCustomer.id.toString().startsWith('C') || parseInt(matchingCustomer.id) >= 500000))) {

              // Only one variant and it's a non-student, use it directly
              setStudentId(matchingCustomer.id.toString());
              setIsStudent(false);
              setIsStudentLocked(false);
              console.log(`Setting non-student ID automatically: ${matchingCustomer.id}`);
            } else {
              // For students, don't automatically assign the ID
              // Just set the customer type to student but require manual ID entry
              setIsStudent(true);
              setIsStudentLocked(true);
              console.log(`Found student customer, but not automatically assigning ID. Manual verification required.`);

              // Clear the student ID field to force manual entry
              setStudentId('');
            }
          }
        } else {
          // Reset student ID if customer name doesn't match any existing customer
          if (!isStudent) {
            // For non-students, just set a temporary placeholder
            // The actual ID will be generated when the order is completed
            setStudentId("Pending ID");
          } else {
            // For students, clear the ID field
            setStudentId('');
          }
        }
      }
    }

    // Clear name error when user types
    if (nameError) setNameError("");
  };

  // This function is used directly in the JSX for suffix buttons
  // See the onClick handler in the suffix buttons section

  // Function to check if student ID already exists in the database
  // Returns true if ID exists but with a different name or different course (is a duplicate)
  // Returns false if ID doesn't exist or if ID exists with the same name and course (allowed)
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

      // Check if any document has the same name and course
      for (const doc of querySnapshot.docs) {
        const data = doc.data();

        // If we find a match with the same name
        if (data.recipient && data.recipient.trim().toLowerCase() === name.trim().toLowerCase()) {
          // For students, also check if the college and program match
          if (isStudent && data.is_student === true) {
            // If college is selected, check if it matches
            if (selectedCollege && data.college && selectedCollege !== data.college) {
              console.log(`Student ID ${id} exists with same name but different college: ${data.college} vs ${selectedCollege}`);
              return true; // Consider it a duplicate if college doesn't match
            }

            // If program is selected, check if it matches
            if (selectedProgram && data.program_code && selectedProgram !== data.program_code) {
              console.log(`Student ID ${id} exists with same name but different program: ${data.program_code} vs ${selectedProgram}`);
              return true; // Consider it a duplicate if program doesn't match
            }
          }

          // If we get here, either it's not a student or the college/program matches
          return false; // Not a duplicate if same name and matching details
        }
      }

      // If we get here, the ID exists but with different names
      return true; // It's a duplicate
    } catch (error) {
      console.error("Error checking for duplicate ID:", error);
      return false; // Assume no duplicate in case of error
    }
  };

  // Generate a unique customer ID for non-students starting from 500001
  const generateCustomerId = async () => {
    try {
      // Check if we have a local counter in localStorage
      const localCounter = localStorage.getItem('lastCustomerId');
      let localCounterValue = localCounter ? parseInt(localCounter) : 500000;

      try {
        // Try to get the customer_counter document from Firestore
        const counterRef = doc(db, "system_counters", "customer_id_counter");
        const counterDoc = await getDoc(counterRef);

        let nextId = 500001; // Default starting value

        if (counterDoc.exists()) {
          // Get the current counter value
          nextId = counterDoc.data().next_id;

          // If the Firestore counter is less than our local counter, use the local counter
          if (nextId <= localCounterValue) {
            nextId = localCounterValue + 1;
          }
        } else {
          // If the counter doesn't exist, use the local counter + 1
          nextId = Math.max(500001, localCounterValue + 1);
        }

        // Try to update the counter in Firestore (increment by 1)
        try {
          await setDoc(counterRef, { next_id: nextId + 1 }, { merge: true });
        } catch (writeError) {
          console.warn("Could not update Firestore counter, but will continue with generated ID:", writeError);
        }

        // Update local state and localStorage
        setLastGeneratedId(nextId);
        localStorage.setItem('lastCustomerId', nextId.toString());

        console.log(`Generated sequential customer ID: ${nextId}`);
        return nextId.toString();
      } catch (firestoreError) {
        // If Firestore access fails, use the local counter
        console.warn("Firestore access failed, using local counter:", firestoreError);

        // Increment the local counter
        const nextId = Math.max(500001, localCounterValue + 1);

        // Update local state and localStorage
        setLastGeneratedId(nextId);
        localStorage.setItem('lastCustomerId', nextId.toString());

        console.log(`Using local counter for customer ID: ${nextId}`);
        return nextId.toString();
      }
    } catch (error) {
      console.error("Error generating customer ID:", error);

      // Ultimate fallback - generate a random ID in the correct range
      const fallbackId = 500000 + Math.floor(Math.random() * 1000) + 1;
      setLastGeneratedId(fallbackId);
      localStorage.setItem('lastCustomerId', fallbackId.toString());

      console.log(`Emergency fallback to random customer ID: ${fallbackId}`);
      return fallbackId.toString();
    }
  };

  // Validate form inputs
  const validateInputs = async () => {
    let isValid = true;

    // Reset errors
    setNameError("");
    setIdError("");
    setProgramError("");

    // Validate name (required)
    if (!customerName.trim()) {
      setNameError("Customer name is required");
      isValid = false;
    } else if (!/^[A-Za-z\s.\-]+$/.test(customerName)) {
      setNameError("Name should only contain letters, spaces, dots, and hyphens");
      isValid = false;
    }

    // For students, validate student ID and program
    if (isStudent) {
      if (!studentId.trim()) {
        setIdError("Student ID is required");
        isValid = false;
      } else if (studentId.length !== 6) {
        setIdError("Student ID must be exactly 6 digits");
        isValid = false;
      } else if (!/^\d+$/.test(studentId)) {
        setIdError("Student ID must contain only numbers");
        isValid = false;
      } else {
        // Check for duplicate ID with different name or course
        const isDuplicate = await checkDuplicateId(studentId, customerName);
        if (isDuplicate) {
          setIdError("This Student ID is already in use with a different name or belongs to a student from a different course");
          isValid = false;
        }
      }

      // Validate college and program selection
      if (!selectedCollege) {
        setProgramError("Please select a college");
        isValid = false;
      } else if (!selectedProgram) {
        setProgramError("Please select a program");
        isValid = false;
      }
    } else {
      // For non-students, check if they already exist
      const existingCustomer = existingCustomers.find(
        c => c.name.toLowerCase() === customerName.toLowerCase()
      );

      if (existingCustomer) {
        // Use existing customer ID
        setStudentId(existingCustomer.id.toString());
      } else if (!studentId || studentId === '') {
        // Set a temporary placeholder - the actual ID will be generated when the order is completed
        setStudentId("Pending ID");
      }
    }

    return isValid;
  };

  // Handle selection of a customer variant from the disambiguation modal
  const handleSelectCustomerVariant = (variant) => {
    // For non-students, we can automatically assign the ID
    if (variant.isStudent === false ||
        (variant.isStudent === undefined &&
         (variant.id.toString().startsWith('C') || parseInt(variant.id) >= 500000))) {

      // Set the ID and customer type for non-students
      setStudentId(variant.id.toString());
      setIsStudent(false);
      setIsStudentLocked(false);
      console.log(`Selected non-student variant with ID ${variant.id}`);

      // Close the modal
      setShowDisambiguationModal(false);
    } else {
      // For students, we need to verify the ID
      // Set the customer type to student
      setIsStudent(true);
      setIsStudentLocked(true);

      // If the variant has college/program info, pre-select it
      if (variant.college) {
        setSelectedCollege(variant.college);

        // If the program code exists and belongs to this college, select it
        if (variant.program_code && collegePrograms[variant.college]) {
          const programExists = collegePrograms[variant.college].some(p => p.code === variant.program_code);
          if (programExists) {
            setSelectedProgram(variant.program_code);
          }
        }
      }

      // Don't automatically set the student ID - require manual verification
      // Just close the disambiguation modal and let the user verify/enter the ID
      console.log(`Selected student variant with ID ${variant.id}, requiring manual verification`);

      // Close the modal
      setShowDisambiguationModal(false);

      // Show a verification message
      alert(`Please verify and enter the student ID for ${selectedCustomerName}. Students from different courses may have the same name.`);
    }
  };

  // Close the disambiguation modal without selecting a customer
  const handleCloseDisambiguationModal = () => {
    setShowDisambiguationModal(false);
    // Reset the student lock when creating a new customer
    setIsStudentLocked(false);

    // Reset to default state for new customer
    if (!isStudent) {
      // For non-students, just set a temporary placeholder
      // The actual ID will be generated when the order is completed
      setStudentId("Pending ID");
    } else {
      setStudentId('');
    }
  };

  // Modified toggleModal function to reset form state
  const handleModalClose = () => {
    // Reset form state
    setCustomerName("");
    setStudentId("");
    setNameError("");
    setIdError("");
    setProgramError("");
    setIsValidating(false);
    setIsStudent(true);
    setCustomerSuffix("");
    setShowDisambiguationModal(false);
    setIsStudentLocked(false); // Reset the student lock when closing the modal
    setSelectedCollege("");
    setSelectedProgram("");

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

  // We already have a formatDate function defined below, so we'll remove this duplicate

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

        // Get the order data early so it's available for all updates
        const orderData = orderDoc.data();
        console.log("Order data:", orderData);

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

            // Get the order data - make sure it's available in the outer scope
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

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "Unknown";

    // If date is a Firebase timestamp
    if (date.seconds) {
      date = new Date(date.seconds * 1000);
    } else if (!(date instanceof Date)) {
      // If it's not already a Date object, try to convert it
      date = new Date(date);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Unknown";
    }

    // Format the date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Customer Disambiguation Modal */}
      {showDisambiguationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
            <div className="bg-amber-500 p-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Multiple Customers Found</h3>
              <button
                onClick={handleCloseDisambiguationModal}
                className="text-white hover:text-amber-100 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              <div className="mb-4">
                <p className="text-gray-700">
                  We found multiple customers with the name <span className="font-semibold">{selectedCustomerName}</span>.
                  Please select the correct customer:
                </p>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {customerVariants.map((variant, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelectCustomerVariant(variant)}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{selectedCustomerName}</span>
                        <div className="text-sm text-gray-500 mt-1">
                          {variant.isStudent ? (
                            <div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Student ID: {variant.id}
                              </span>
                              {variant.college && (
                                <div className="mt-1 text-xs text-gray-600">
                                  <span className="font-medium">College:</span> {variant.college}
                                </div>
                              )}
                              {variant.program_code && (
                                <div className="text-xs text-gray-600">
                                  <span className="font-medium">Program:</span> {variant.program_code}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Customer ID: {variant.id.startsWith('C') ? variant.id : variant.id}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Last Order</div>
                        <div className="text-sm">{formatDate(variant.lastOrder)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-between">
                <button
                  onClick={handleCloseDisambiguationModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Create New
                </button>
                <div className="text-sm text-gray-500 italic">
                  Select the correct customer record
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => decreaseQuantity(index)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
                      >
                        -
                      </button>

                      {editingQuantityIndex === index ? (
                        <div className="relative flex-1 min-w-[60px]">
                          <input
                            type="number"
                            min="1"
                            max="30"
                            value={quantities[index] || 1}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            onBlur={finalizeQuantityEdit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                finalizeQuantityEdit();
                              }
                            }}
                            className="w-full h-8 text-center font-medium border border-amber-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            autoFocus
                          />
                          <div className="absolute right-2 top-[-18px] text-xs text-gray-500">
                            Max: 30
                          </div>
                        </div>
                      ) : (
                        <button
                          className="flex-1 min-w-[60px] h-8 px-2 flex items-center justify-center text-gray-700 font-medium bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
                          onClick={() => setEditingQuantityIndex(index)}
                        >
                          {quantities[index] || 1}
                        </button>
                      )}

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
              className="bg-white w-full max-w-[480px] mx-4 rounded-2xl shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 sm:px-6 md:px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-xl">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Complete Order</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Enter customer details to proceed</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="px-5 sm:px-6 md:px-8 py-5 space-y-4">
                {/* Customer Type Toggle */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-900">
                      Customer Type
                    </label>
                    {isStudentLocked && (
                      <div className="flex items-center text-xs text-amber-600 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Student type locked</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsStudent(true)}
                      className={`flex-1 py-2.5 px-2 rounded-xl text-sm transition-all ${
                        isStudent
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-medium">Student</span>
                        <span className="text-xs mt-0.5 opacity-80">6-digit ID required</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => !isStudentLocked && setIsStudent(false)}
                      disabled={isStudentLocked}
                      className={`flex-1 py-2.5 px-2 rounded-xl text-sm transition-all ${
                        !isStudent
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : isStudentLocked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="font-medium">Non-Student</span>
                        <span className="text-xs mt-0.5 opacity-80">Auto-generated ID</span>
                      </div>
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    {isStudent
                      ? "For students with a valid 6-digit student ID number."
                      : "For regular customers. A unique 6-digit ID starting from 500001 will be automatically assigned when the order is completed."}
                  </p>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Juan Dela Cruz"
                    className={`w-full px-3 py-2 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2
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

                {/* Name Suffix */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Suffix (Optional)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Jr.", "Sr.", "I", "II", "III", "IV", "V"].map((suffix) => (
                      <button
                        key={suffix}
                        type="button"
                        onClick={() => {
                          // If already selected, deselect it
                          if (customerSuffix === suffix) {
                            setCustomerSuffix("");

                            // Remove suffix from name if present
                            if (customerName.endsWith(` ${suffix}`)) {
                              setCustomerName(customerName.substring(0, customerName.length - suffix.length - 1));
                            }
                          } else {
                            // Otherwise select it and update name
                            let baseName = customerName;
                            const suffixes = [" Jr.", " Sr.", " I", " II", " III", " IV", " V"];

                            // Remove any existing suffix
                            for (const s of suffixes) {
                              if (baseName.endsWith(s)) {
                                baseName = baseName.substring(0, baseName.length - s.length);
                                break;
                              }
                            }

                            setCustomerSuffix(suffix);
                            setCustomerName(baseName.trim() + " " + suffix);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          customerSuffix === suffix
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
                        }`}
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer ID - different based on customer type */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    {isStudent ? "Student ID" : "Customer ID"}
                  </label>
                  {isStudent ? (
                    // Student ID input with verification note
                    <div>
                      <input
                        type="text"
                        placeholder="Enter 6-digit Student ID"
                        maxLength={6}
                        className={`w-full px-3 py-2 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2
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
                      <p className="mt-1.5 text-xs text-amber-600">
                        <span className="font-medium">Important:</span> Please verify this is the correct student ID. Students with the same name may be from different courses.
                      </p>
                    </div>
                  ) : (
                    // Non-student ID display with enhanced information
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <input
                          type="text"
                          placeholder="Will be generated when order is completed"
                          className="w-full px-3 py-2 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2
                          focus:ring-emerald-500/20 transition-all text-sm"
                          value={studentId}
                          readOnly
                        />
                        {studentId && (
                          <div className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium ${
                            existingCustomers.find(c => c.name.toLowerCase() === customerName.toLowerCase())
                              ? "bg-blue-100 text-blue-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {existingCustomers.find(c => c.name.toLowerCase() === customerName.toLowerCase())
                              ? "Existing"
                              : "New"}
                          </div>
                        )}
                      </div>

                      {/* Informational text for non-student customers */}
                      <div className="mt-2 text-xs text-gray-500">
                        {existingCustomers.find(c => c.name.toLowerCase() === customerName.toLowerCase())
                          ? "This customer already exists in our records. Their existing ID will be used."
                          : "A unique 6-digit ID starting from 500001 will be automatically assigned when the order is completed."}
                      </div>

                      {/* Show last order date for existing customers */}
                      {existingCustomers.find(c => c.name.toLowerCase() === customerName.toLowerCase()) && (
                        <div className="mt-1 text-xs text-gray-600">
                          Last order: {formatDate(
                            existingCustomers.find(c => c.name.toLowerCase() === customerName.toLowerCase())?.lastOrder
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  {idError && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                      <FiAlertCircle size={14} />
                      <span>{idError}</span>
                    </p>
                  )}
                </div>

                {/* College and Program Selection - Only for students */}
                {isStudent && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        College
                      </label>
                      <select
                        className={`w-full px-3 py-2 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2
                        ${programError ? 'focus:ring-red-500/20 bg-red-50' : 'focus:ring-emerald-500/20'}
                        transition-all text-sm`}
                        value={selectedCollege}
                        onChange={(e) => {
                          setSelectedCollege(e.target.value);
                          setSelectedProgram(""); // Reset program when college changes
                          if (programError) setProgramError("");
                        }}
                      >
                        <option value="">Select College</option>
                        {Object.keys(collegePrograms).map((college) => (
                          <option key={college} value={college}>
                            {college}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedCollege && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          Program
                        </label>
                        <select
                          className={`w-full px-3 py-2 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2
                          ${programError ? 'focus:ring-red-500/20 bg-red-50' : 'focus:ring-emerald-500/20'}
                          transition-all text-sm`}
                          value={selectedProgram}
                          onChange={(e) => {
                            setSelectedProgram(e.target.value);
                            if (programError) setProgramError("");
                          }}
                        >
                          <option value="">Select Program</option>
                          {collegePrograms[selectedCollege].map((program) => (
                            <option key={program.code} value={program.code}>
                              {program.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {programError && (
                      <p className="mt-1 text-sm text-red-500 flex items-center gap-1.5">
                        <FiAlertCircle size={14} />
                        <span>{programError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="px-5 sm:px-6 md:px-8 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleModalClose}
                    className="px-3 py-2 text-gray-700 bg-white rounded-xl border border-gray-200
                             hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNameSubmit}
                    disabled={isValidating}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5
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
              className="bg-white w-full max-w-[420px] mx-4 rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="px-5 py-4 bg-emerald-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-emerald-400/30 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-sm">Confirm Order</h3>
                  </div>
                  <button onClick={toggleConfirmOrderModal} className="p-1 hover:bg-emerald-400/30 rounded-lg transition-colors">
                    <MdCancel size={18} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Order Details */}
                <div className="space-y-3">
                  {/* Order ID and Payment Method */}
                  <div className="flex justify-between items-center py-2.5 px-3 bg-emerald-50 rounded-xl">
                    <span className="text-sm font-medium text-emerald-900">Order #{orderNumber}</span>
                    <span className="text-sm text-emerald-700">{paymentMode}</span>
                  </div>

                  {/* Customer Information */}
                  <div className="p-3 bg-blue-50 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-900">{customerName || "Guest"}</span>
                    </div>

                    {studentId && (
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                        <span className="text-xs text-blue-800">
                          {isStudent ? `Student ID: ${studentId}` : `Customer ID: ${studentId}`}
                        </span>
                      </div>
                    )}

                    {isStudent && selectedCollege && selectedProgram && (
                      <div className="flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-xs text-blue-800">
                          {selectedProgram} - {selectedCollege.split(" ").slice(0, 3).join(" ")}...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1.5">
                    {displayItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                        {/* Display the image from the URL if available */}
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                          <div className="flex items-center justify-between mt-0.5">
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
                  <div className="flex justify-between items-center py-2.5 px-3 bg-emerald-50 rounded-xl">
                    <span className="font-medium text-emerald-900">Total Amount</span>
                    <span className="text-lg font-bold text-emerald-700">₱{subtotal.toFixed(2)}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex gap-2 text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-2 bg-gray-50 rounded-lg flex-1">
                      <Calendar size={12} className="text-gray-400" />
                      <span className="text-gray-600">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-2 bg-gray-50 rounded-lg flex-1">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-gray-600">{timeToday}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={handleConfirmOrder}
                  className="w-full py-2 bg-emerald-500 text-white rounded-xl font-medium
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
              className="bg-white w-full max-w-[360px] mx-4 rounded-2xl shadow-2xl overflow-hidden text-center p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <FaCheckCircle className="w-8 h-8 text-emerald-500" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Order Completed
                </h3>

                <div className="text-sm text-gray-600 mb-2">
                  Order #{orderNumber} has been successfully placed
                </div>

                <div className="text-center mb-4">
                  <p className="text-gray-500">
                    {customerName ? `Order for ${customerName}` : 'Your order'} has been successfully processed
                  </p>
                  {isStudent && studentId && (
                    <p className="text-xs text-gray-400 mt-1">
                      Student ID: {studentId}
                    </p>
                  )}
                </div>

                <div className="bg-emerald-50 px-4 py-2 rounded-lg mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-medium text-emerald-800">
                      Order #{orderNumber}
                    </span>
                    <span className="text-xs text-emerald-600">
                      {formattedDate} • {paymentMode}
                    </span>
                  </div>
                  {subtotal > 0 && totalQuantity > 0 ? (
                    <div className="text-xs text-emerald-700 mt-1 text-center">
                      Total: ₱{subtotal.toFixed(2)} • Items: {totalQuantity}
                    </div>
                  ) : null}
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

      {/* Maximum Order Limit Modal */}
      {showMaxOrderModal && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowMaxOrderModal(false)}
          >
            <motion.div
              className="bg-white w-full max-w-[360px] mx-4 rounded-2xl shadow-2xl overflow-hidden text-center p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Maximum Order Limit</h3>
                <p className="text-gray-600 text-center mb-6">
                  We can only accommodate a maximum of 30 items per product in a single order.
                </p>
                <button
                  onClick={() => setShowMaxOrderModal(false)}
                  className="w-full py-2.5 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30"
                >
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default DashboardOrder;