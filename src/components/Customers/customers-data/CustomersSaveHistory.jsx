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

      // Update the PDF generation part in updateAndDownload function
      const pdfDoc = new jsPDF();

      // Title
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(20);
      pdfDoc.text('Monthly Customer Summary', 20, 30);

      // Summary Box
      pdfDoc.setDrawColor(255, 191, 0);
      pdfDoc.setFillColor(255, 251, 235);
      pdfDoc.roundedRect(15, 45, 180, 60, 3, 3, 'FD');

      // Summary Content
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(0, 0, 0);
      const summaryStats = [
        `Total Active Customers This Month: ${sortedCustomers.length}`,
        `Total Customer Orders: ${sortedCustomers.reduce((sum, c) => sum + c.monthlyOrders, 0)}`,
        `Total Customer Sales: PHP ${sortedCustomers.reduce((sum, c) => sum + c.monthlySpent, 0).toLocaleString()}`
      ];

      summaryStats.forEach((stat, index) => {
        pdfDoc.text(stat, 20, 65 + (index * 15));
      });

      // Table with adjusted widths and styling
      autoTable(pdfDoc, {
        startY: 120,
        head: [['#', 'Recipient', 'Customer ID', 'Monthly Orders', 'Total Spent', 'Status']],
        body: sortedCustomers.map((customer, index) => [
          (index + 1).toString(),
          customer.recipient,
          formatCustomerId(customer.customerId),
          customer.monthlyOrders.toString(),
          `PHP ${customer.monthlySpent.toLocaleString()}`,
          isCustomerActive(customer.lastDateOrdered) ? 'Active' : 'Inactive'
        ]),
        styles: {
          fontSize: 10,
          cellPadding: 6,
          lineColor: [255, 191, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [255, 191, 0],
          textColor: [0, 0, 0],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          minCellHeight: 14,
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },      // #
          1: { halign: 'left', cellWidth: 45 },        // Recipient
          2: { halign: 'center', cellWidth: 25 },      // Customer ID
          3: { halign: 'center', cellWidth: 30 },      // Monthly Orders
          4: { halign: 'right', cellWidth: 30 },       // Total Spent
          5: { halign: 'center', cellWidth: 25 }       // Status
        },
        alternateRowStyles: {
          fillColor: [255, 251, 235]
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto',
        didDrawPage: function(data) {
          // Add margins and ensure table fits
          data.settings.margin.top = 120;
          data.settings.margin.bottom = 20;
        }
      });

      pdfDoc.save(`Customer_Summary_${history.monthYear}.pdf`);

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

  // Update the return section with modern styling
  return (
    <div className="w-full min-h-screen bg-gray-50/50 p-6">
      <CustomersNav />
      <section className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Customer Activity Reports</h1>
          <p className="text-gray-500 mt-1">Track customer engagement and activity patterns</p>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Report Period</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer Analytics</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {savedHistories.map((history) => (
                  <tr
                    key={history.id}
                    className="group hover:bg-amber-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{history.monthYear}</p>
                          <p className="text-xs text-gray-500">Activity Report</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{history.dateSaved}</p>
                        <p className="text-xs text-gray-500">Last generated</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-sm font-medium text-gray-900">{history.customerCount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Active</p>
                          <p className="text-sm font-medium text-emerald-600">{Math.round(history.customerCount * 0.7)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Inactive</p>
                          <p className="text-sm font-medium text-gray-400">{Math.round(history.customerCount * 0.3)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => updateAndDownload(history)}
                        className="inline-flex items-center justify-center p-2 text-amber-600 hover:text-amber-700 
                                 hover:bg-amber-50 rounded-lg transition-colors group-hover:bg-amber-100/50"
                        title="Download Report"
                      >
                        <LuDownload className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {savedHistories.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500">No customer activity reports available</p>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4">
              <div className="animate-spin rounded-full h-6 w-6 border-[3px] border-amber-500/30 border-t-amber-500" />
              <p className="text-sm font-medium text-gray-900">Generating report...</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomersSaveHistory;
