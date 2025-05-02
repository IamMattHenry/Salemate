import React, { useState, useEffect } from "react";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { LuDownload } from "react-icons/lu";
import CustomersNav from "../CustomersNav";
import firebaseApp from "../../../firebaseConfig";

// Add this new function after your existing imports
const checkAndCreateMonthlyReport = async (db) => {
  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  
  try {
    // Check if we already have a report for this month
    const monthQuery = query(
      collection(db, "customer_history"),
      where("monthYear", "==", currentMonthYear)
    );
    
    const monthSnapshot = await getDocs(monthQuery);
    
    if (monthSnapshot.empty) {
      // Calculate start and end of current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Get orders for current month
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
      
      // Create new monthly record
      await addDoc(collection(db, "customer_history"), {
        monthYear: currentMonthYear,
        dateSaved: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        customerCount: customerData.size,
        totalOrders: Array.from(customerData.values()).reduce((sum, c) => sum + c.monthlyOrders, 0),
        totalSpent: Array.from(customerData.values()).reduce((sum, c) => sum + c.monthlySpent, 0)
      });
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
      const histories = savedSnapshot.docs.map(doc => ({
        id: doc.id,
        monthYear: doc.data().monthYear,
        dateSaved: doc.data().dateSaved ? 
          new Date(doc.data().dateSaved.toDate()).toLocaleDateString() :
          'No date',
        customerCount: doc.data().customerCount || 0,
        totalOrders: doc.data().totalOrders || 0,
        totalSpent: doc.data().totalSpent || 0
      }));
      
      setSavedHistories(histories);
    } catch (error) {
      console.error("Error fetching histories:", error);
    }
  };

  const handleDownload = async (history) => {
    try {
      setLoading(true);
      
      // Get the date range for the selected month
      const [month, year] = history.monthYear.split(' ');
      const startOfMonth = new Date(`${month} 1, ${year}`);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

      // Update query to filter by date range
      const ordersQuery = query(
        collection(db, "order_transaction"),
        where("order_date", ">=", startOfMonth),
        where("order_date", "<=", endOfMonth),
        orderBy("order_date", "desc")
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      const customerData = new Map();

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

      const pdfDoc = new jsPDF();
      pdfDoc.setFontSize(18);
      pdfDoc.text(`Customer Report - ${history.monthYear}`, 14, 20);

      // Add summary
      pdfDoc.setFontSize(12);
      pdfDoc.text([
        `Total Customers: ${history.customerCount}`,
        `Total Orders: ${history.totalOrders}`,
        `Total Sales: PHP ${history.totalSpent.toLocaleString()}`
      ], 14, 40);

      // Add Top 5 by Total Spent
      pdfDoc.setFontSize(14);
      pdfDoc.text('Top 5 Customers by Total Spent', 14, 70);

      const top5BySpent = Array.from(customerData.values())
        .sort((a, b) => b.monthlySpent - a.monthlySpent)
        .slice(0, 5);

      autoTable(pdfDoc, {
        startY: 75,
        head: [['Rank', 'Recipient', 'Total Spent', 'Monthly Orders']],
        body: top5BySpent.map((customer, index) => [
          `#${index + 1}`,
          customer.recipient,
          `PHP ${customer.monthlySpent.toLocaleString()}`,
          customer.monthlyOrders
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [241, 196, 15] },
        theme: 'grid'
      });

      // Add All Customers section
      pdfDoc.setFontSize(14);
      pdfDoc.text('All Customers', 14, pdfDoc.lastAutoTable.finalY + 20);

      const sortedCustomers = Array.from(customerData.values())
        .sort((a, b) => b.monthlySpent - a.monthlySpent);

      autoTable(pdfDoc, {
        startY: pdfDoc.lastAutoTable.finalY + 25,
        head: [['Recipient', 'Customer ID', 'Monthly Orders', 'Total Spent', 'Status']],
        body: sortedCustomers.map(customer => [
          customer.recipient,
          formatCustomerId(customer.customerId), // Apply the formatter here
          customer.monthlyOrders,
          `PHP ${customer.monthlySpent.toLocaleString()}`,
          isCustomerActive(customer.lastDateOrdered) ? 'Active' : 'Inactive'
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [241, 196, 15] },
        theme: 'grid'
      });

      pdfDoc.save(`${history.monthYear}.pdf`);
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

  useEffect(() => {
    fetchSavedHistories();
    checkAndCreateMonthlyReport(db);
    
    // Set up daily check at midnight
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0, 0, 0
    );
    const msToMidnight = night.getTime() - now.getTime();
    
    const initialTimeout = setTimeout(() => {
      checkAndCreateMonthlyReport(db);
      const dailyInterval = setInterval(() => {
        checkAndCreateMonthlyReport(db);
      }, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, msToMidnight);
    
    return () => clearTimeout(initialTimeout);
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
                      onClick={() => handleDownload(history)}
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
