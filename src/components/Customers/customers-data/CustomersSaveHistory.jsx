import React, { useState, useEffect } from "react";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  addDoc,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  onSnapshot,
  doc
} from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { LuDownload } from "react-icons/lu";
import CustomersNav from "../CustomersNav";
import firebaseApp from "../../../firebaseConfig";

// Modify the checkAndCreateMonthlyReport function
const checkAndCreateMonthlyReport = async (db) => {
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  try {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Get current orders data
    const ordersQuery = query(
      collection(db, "order_transaction"),
      where("order_date", ">=", startOfMonth),
      where("order_date", "<=", endOfMonth),
      orderBy("order_date", "desc")
    );
    
    const ordersSnapshot = await getDocs(ordersQuery);
    const customerData = new Map();
    
    // Process orders
    ordersSnapshot.docs.forEach(doc => {
      const order = doc.data();
      if (!order.customer_id || !order.order_date) return;
      
      const customerId = order.customer_id;
      if (!customerData.has(customerId)) {
        customerData.set(customerId, {
          monthlyOrders: 0,
          monthlySpent: 0
        });
      }
      
      const customer = customerData.get(customerId);
      if (order.order_status !== "Cancelled") {
        customer.monthlyOrders++;
        customer.monthlySpent += Number(order.order_total || 0);
      }
    });

    // Find existing report for current month
    const monthQuery = query(
      collection(db, "customer_history"),
      where("monthYear", "==", currentMonthYear)
    );
    
    const monthSnapshot = await getDocs(monthQuery);

    const reportData = {
      monthYear: currentMonthYear,
      lastUpdated: serverTimestamp(),
      customerCount: customerData.size,
      totalOrders: Array.from(customerData.values())
        .reduce((sum, c) => sum + c.monthlyOrders, 0),
      totalSpent: Array.from(customerData.values())
        .reduce((sum, c) => sum + c.monthlySpent, 0)
    };

    // Update or create report
    if (!monthSnapshot.empty) {
      const docRef = monthSnapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...reportData,
        dateSaved: monthSnapshot.docs[0].data().dateSaved // Keep original creation date
      });
      console.log(`Updated existing report for ${currentMonthYear}`);
    } else {
      await addDoc(collection(db, "customer_history"), {
        ...reportData,
        dateSaved: serverTimestamp() // New report gets current timestamp
      });
      console.log(`Created new report for ${currentMonthYear}`);
    }
  } catch (error) {
    console.error("Error checking/creating monthly report:", error);
  }
};

const CustomersSaveHistory = () => {
  const [savedHistories, setSavedHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const db = getFirestore(firebaseApp);

  // Add isCustomerActive function
  const isCustomerActive = (lastOrderDate) => {
    if (!lastOrderDate) return false;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return lastOrderDate >= sevenDaysAgo;
  };

  // Add this formatter function after the isCustomerActive function
  const formatCustomerId = (id) => {
    if (!id) return '';
    // Convert to string and pad with leading zeros if needed
    const idString = id.toString().padStart(6, '0');
    // Split into groups and join with hyphens
    const firstTwo = idString.slice(0, 2);
    const lastFour = idString.slice(2);
    return `${firstTwo}-${lastFour}`;
  };

  const fetchSavedHistories = async () => {
    try {
      const savedQuery = query(
        collection(db, "customer_history"),
        orderBy("dateSaved", "desc")
      );
      
      const savedSnapshot = await getDocs(savedQuery);
      const uniqueHistories = new Map(); // Use Map to track unique monthYear entries

      // Keep only the most recent entry for each monthYear
      savedSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const monthYear = data.monthYear;
        
        if (!uniqueHistories.has(monthYear)) {
          uniqueHistories.set(monthYear, {
            id: doc.id,
            monthYear: monthYear,
            dateSaved: data.dateSaved ? 
              new Date(data.dateSaved.toDate()).toLocaleDateString() :
              'No date',
            customerCount: data.customerCount || 0,
            totalOrders: data.totalOrders || 0,
            totalSpent: data.totalSpent || 0
          });
        } else {
          // Delete duplicate document
          deleteDoc(doc.ref).catch(err => 
            console.error("Error deleting duplicate:", err)
          );
        }
      });

      // Convert Map values to array for state
      const histories = Array.from(uniqueHistories.values());
      setSavedHistories(histories);
      
    } catch (error) {
      console.error("Error fetching histories:", error);
    }
  };

  // Remove automatic download from handleDownload function and rename it to updateAndDownload
  const updateAndDownload = async (history) => {
    try {
      setLoading(true);
      
      // Get the date range for the selected month
      const [month, year] = history.monthYear.split(' ');
      const startOfMonth = new Date(`${month} 1, ${year}`);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

      // Query orders for the selected month
      const ordersQuery = query(
        collection(db, "order_transaction"),
        where("order_date", ">=", startOfMonth),
        where("order_date", "<=", endOfMonth),
        orderBy("order_date", "desc")
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const customerData = new Map();

      // Process orders and build customer data
      ordersSnapshot.docs.forEach(doc => {
        const order = doc.data();
        if (!order.customer_id) return;

        const customerId = order.customer_id;
        const orderDate = order.order_date?.toDate();
        if (!orderDate) return;
        
        if (!customerData.has(customerId)) {
          customerData.set(customerId, {
            recipient: order.recipient || 'Unknown',
            customerId,
            monthlyOrders: 0,
            monthlySpent: 0,
            lastDateOrdered: orderDate
          });
        }

        const customer = customerData.get(customerId);
        if (order.order_status !== "Cancelled") {
          customer.monthlyOrders++;
          customer.monthlySpent += Number(order.order_total || 0);
        }
      });

      // Sort customers by amount spent
      const sortedCustomers = Array.from(customerData.values())
        .sort((a, b) => b.monthlySpent - a.monthlySpent);

      // Generate PDF
      const pdfDoc = new jsPDF();
      
      // Header
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(16);
      pdfDoc.text(`Total Customer Report`, pdfDoc.internal.pageSize.width / 2, 20, { align: "center" });
      pdfDoc.setFontSize(12);
      pdfDoc.text(`For the Month of ${history.monthYear}`, pdfDoc.internal.pageSize.width / 2, 30, { align: "center" });

      // Summary box
      pdfDoc.setDrawColor(241, 196, 15);
      pdfDoc.setLineWidth(0.5);
      pdfDoc.roundedRect(14, 40, 182, 40, 3, 3);

      // Summary content
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(12);
      pdfDoc.text('Monthly Customer Summary', 20, 50);

      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.setFontSize(10);
      const summaryData = [
        `Total Active Customers This Month: ${sortedCustomers.length}`,
        `Total Customer Orders: ${sortedCustomers.reduce((sum, c) => sum + c.monthlyOrders, 0)}`,
        `Total Customer Sales: PHP ${sortedCustomers.reduce((sum, c) => sum + c.monthlySpent, 0).toLocaleString()}`
      ];
      
      summaryData.forEach((text, index) => {
        pdfDoc.text(text, 20, 60 + (index * 8));
      });

      // Customer table
      autoTable(pdfDoc, {
        startY: 90,  // Moved down to accommodate new header
        head: [['#', 'Recipient', 'Customer ID', 'Monthly Orders', 'Total Spent', 'Status']],
        body: sortedCustomers.map((customer, index) => [
          (index + 1).toString(),
          customer.recipient,
          formatCustomerId(customer.customerId),
          customer.monthlyOrders,
          `PHP ${customer.monthlySpent.toLocaleString()}`,
          isCustomerActive(customer.lastDateOrdered) ? 'Active' : 'Inactive'
        ]),
        styles: { fontSize: 8 },
        headStyles: { 
          fillColor: [241, 196, 15],
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'right' },
          5: { halign: 'center' }
        },
        theme: 'grid'
      });

      // Save PDF
      pdfDoc.save(`${history.monthYear}.pdf`);

      // Update document in Firestore
      const historyRef = doc(db, "customer_history", history.id);
      await updateDoc(historyRef, {
        lastUpdated: serverTimestamp(),
        customerCount: sortedCustomers.length,
        totalOrders: sortedCustomers.reduce((sum, c) => sum + c.monthlyOrders, 0),
        totalSpent: sortedCustomers.reduce((sum, c) => sum + c.monthlySpent, 0)
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add this function inside CustomersSaveHistory component
  const generateHistoricalReports = async () => {
    try {
      setLoading(true);
      
      // Set April 30, 2025 as the date saved
      const aprilDate = new Date(2025, 3, 30); // Month is 0-based, 3 = April
      
      // Get April 2025 date range
      const startOfApril = new Date(2025, 3, 1);
      const endOfApril = new Date(2025, 4, 0);
      
      // Query April orders
      const aprilOrdersQuery = query(
        collection(db, "order_transaction"),
        where("order_date", ">=", startOfApril),
        where("order_date", "<=", endOfApril),
        orderBy("order_date", "desc")
      );
      
      const aprilSnapshot = await getDocs(aprilOrdersQuery);
      const aprilData = new Map();
      
      // Process April orders
      aprilSnapshot.docs.forEach(doc => {
        const order = doc.data();
        if (!order.customer_id || !order.order_date) return;
        
        const customerId = order.customer_id;
        if (!aprilData.has(customerId)) {
          aprilData.set(customerId, {
            monthlyOrders: 0,
            monthlySpent: 0
          });
        }
        
        const customer = aprilData.get(customerId);
        if (order.order_status !== "Cancelled") {
          customer.monthlyOrders++;
          customer.monthlySpent += Number(order.order_total || 0);
        }
      });
      
      // Check if April report exists
      const aprilQuery = query(
        collection(db, "customer_history"),
        where("monthYear", "==", "April 2025")
      );
      
      const aprilReportSnapshot = await getDocs(aprilQuery);
      
      if (aprilReportSnapshot.empty && aprilData.size > 0) {
        // Create April report with April 30 date
        await addDoc(collection(db, "customer_history"), {
          monthYear: "April 2025",
          dateSaved: aprilDate,
          lastUpdated: aprilDate,
          customerCount: aprilData.size,
          totalOrders: Array.from(aprilData.values()).reduce((sum, c) => sum + c.monthlyOrders, 0),
          totalSpent: Array.from(aprilData.values()).reduce((sum, c) => sum + c.monthlySpent, 0)
        });
      }
      
      await fetchSavedHistories();
    } catch (error) {
      console.error("Error generating historical reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add a cleanup function for duplicate reports
  const cleanupDuplicateReports = async () => {
    try {
      const reportsQuery = query(
        collection(db, "customer_history"),
        orderBy("dateSaved", "desc")
      );
      
      const snapshot = await getDocs(reportsQuery);
      const reportsByMonth = new Map();
      
      // Keep only the latest report for each month
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!reportsByMonth.has(data.monthYear)) {
          reportsByMonth.set(data.monthYear, doc.id);
        } else {
          // Delete duplicate report
          deleteDoc(doc.ref);
          console.log(`Deleted duplicate report for ${data.monthYear}`);
        }
      });
      
      // Refresh the display
      await fetchSavedHistories();
      
    } catch (error) {
      console.error("Error cleaning up duplicate reports:", error);
    }
  };

  // Update useEffect to only update data without downloading
  useEffect(() => {
    fetchSavedHistories();
    
    // Listen for order changes and update existing report
    const ordersRef = collection(db, "order_transaction");
    const unsubscribe = onSnapshot(ordersRef, async (snapshot) => {
      if (snapshot.docChanges().length > 0) {
        // Update current month's data only
        await checkAndCreateMonthlyReport(db);
      }
    });

    return () => unsubscribe();
  }, [db]);

  return (
    <div className="w-full">
      <CustomersNav />
      <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4">
        <div className="overflow-x-auto">
          <table className="w-full text-[1rem]">
            <thead>
              <tr className="leading-normal border-b-[0.5px] border-b-gray-600/50">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Date Saved</th>
              </tr>
            </thead>
            <tbody>
              {savedHistories.map((history) => (
                <tr
                  key={history.id}
                  className="hover:bg-yellowsm/20 hover:shadow-sm border-b-[0.5px] border-yellowsm/50"
                >
                  <td className="py-3 px-6 text-left">
                    {`${history.monthYear}.pdf`}
                  </td>
                  <td className="py-3 px-6 text-left">{history.dateSaved}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => updateAndDownload(history)}
                      className="text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <LuDownload size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {loading && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            <p className="mt-2 text-sm">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersSaveHistory;
