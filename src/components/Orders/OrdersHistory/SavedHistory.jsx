import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy, addDoc, serverTimestamp, limit, updateDoc, doc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import firebaseApp from "../../../firebaseConfig";
import { LuDownload } from "react-icons/lu"; // Add this import at the top

const SavedHistory = () => {
  const [loading, setLoading] = useState(false);
  const [savedHistories, setSavedHistories] = useState([]);
  const db = getFirestore(firebaseApp);

  const fetchSavedHistories = async () => {
    try {
      // Get saved histories
      const savedQuery = query(
        collection(db, "saved_history"),
        orderBy("dateSaved", "desc")
      );
      
      const savedSnapshot = await getDocs(savedQuery);
      const histories = savedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateSaved: new Date(doc.data().dateSaved.seconds * 1000).toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: '2-digit'
        })
      }));

      setSavedHistories(histories);
    } catch (error) {
      console.error("Error fetching histories:", error);
    }
  };

  const generatePDF = async (monthYear, transactions) => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text("Monthly Transaction Report", 14, 15);
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Period: ${monthYear}`, 14, 25);

      let currentY = 35;

      // Calculate analytics
      const totalOrders = transactions.length;
      const completedOrders = transactions.filter(t => t.order_status === "Delivered").length;
      const pendingOrders = transactions.filter(t => t.order_status === "Preparing").length;
      const cancelledOrders = transactions.filter(t => t.order_status === "Cancelled").length;
      const totalSales = transactions
        .filter(t => t.order_status === "Delivered")
        .reduce((sum, t) => sum + (parseFloat(t.order_total) || 0), 0);

      // Add analytics with PHP text instead of symbol
      const analytics = [
        `Total Orders: ${totalOrders}`,
        `Completed Orders: ${completedOrders}`,
        `Pending Orders: ${pendingOrders}`,
        `Cancelled Orders: ${cancelledOrders}`,
        `Total Sales: PHP ${totalSales.toLocaleString()}`
      ];

      analytics.forEach(line => {
        doc.text(line, 14, currentY);
        currentY += 6;
      });

      currentY += 10;

      // Add tables for each status with PHP text
      const statuses = ['Delivered', 'Preparing', 'Cancelled'];
      for (const status of statuses) {
        const filteredTransactions = transactions.filter(t => t.order_status === status);
        if (filteredTransactions.length > 0) {
          doc.text(`${status} Orders`, 14, currentY);
          currentY += 5;

          autoTable(doc, {
            startY: currentY,
            head: [['Order ID', 'Name', 'Recipient', 'Amount', 'Date']],
            body: filteredTransactions.map(order => [
              order.order_id,
              order.order_name,
              order.recipient,
              `PHP ${parseFloat(order.order_total).toLocaleString()}`,
              new Date(order.order_date.seconds * 1000).toLocaleDateString()
            ]),
            styles: { fontSize: 8 },
            headStyles: { fillColor: [255, 207, 80] }
          });

          currentY = doc.lastAutoTable.finalY + 10;
        }
      }

      // Save PDF
      doc.save(`${monthYear.replace(' ', '')}_Transactions.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add this new function to get fresh transactions
  const getFreshTransactions = async (monthYear) => {
    try {
      const transactionQuery = query(
        collection(db, "order_transaction"),
        orderBy("order_date", "desc")
      );
      
      const transactionSnapshot = await getDocs(transactionQuery);
      const allTransactions = transactionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter for the specific month/year
      const [month, year] = monthYear.split(" ");
      return allTransactions.filter(t => {
        const orderDate = new Date(t.order_date.seconds * 1000);
        return orderDate.toLocaleString('en-US', { month: 'long' }) === month &&
               orderDate.getFullYear().toString() === year;
      });
    } catch (error) {
      console.error("Error getting fresh transactions:", error);
      return [];
    }
  };

  // Update the handleRowClick function
  const handleRowClick = async (history) => {
    setLoading(true);
    try {
      // Get fresh transactions first
      const freshTransactions = await getFreshTransactions(history.monthYear);
      
      // Update the record with fresh transactions
      const monthCheckQuery = query(
        collection(db, "saved_history"),
        orderBy("dateSaved", "desc")
      );
      
      const monthCheckSnapshot = await getDocs(monthCheckQuery);
      const existingRecord = monthCheckSnapshot.docs.find(doc => doc.id === history.id);

      if (existingRecord) {
        await updateDoc(doc(db, "saved_history", existingRecord.id), {
          transactions: freshTransactions,
          lastUpdated: serverTimestamp()
        });
      }

      // Generate PDF with fresh transactions
      await generatePDF(history.monthYear, freshTransactions);
      
      // Refresh the list
      await fetchSavedHistories();
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Error updating and generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkAndSaveCurrentMonth = async () => {
    try {
      const currentDate = new Date();
      const currentMonthYear = currentDate.toLocaleDateString('en-US', { 
        month: 'long',
        year: 'numeric' 
      });

      // Check if we already have a save for this month
      const monthCheckQuery = query(
        collection(db, "saved_history"),
        orderBy("dateSaved", "desc"),
        limit(1)
      );

      const monthCheckSnapshot = await getDocs(monthCheckQuery);
      const lastSave = monthCheckSnapshot.docs[0]?.data();

      if (lastSave) {
        const lastSaveDate = new Date(lastSave.dateSaved.seconds * 1000);
        
        // If last save was in a different month, create new save
        if (lastSaveDate.getMonth() !== currentDate.getMonth() || 
            lastSaveDate.getFullYear() !== currentDate.getFullYear()) {
          await createNewMonthlySave(currentMonthYear);
        }
      } else {
        // No previous saves exist, create first save
        await createNewMonthlySave(currentMonthYear);
      }
    } catch (error) {
      console.error("Error checking monthly save:", error);
    }
  };

  const createNewMonthlySave = async (monthYear, transactions) => {
    try {
      // First check if a record for this month already exists
      const monthCheckQuery = query(
        collection(db, "saved_history"),
        orderBy("dateSaved", "desc")
      );
      
      const monthCheckSnapshot = await getDocs(monthCheckQuery);
      const existingRecord = monthCheckSnapshot.docs.find(doc => {
        const data = doc.data();
        const savedDate = new Date(data.dateSaved.seconds * 1000);
        const currentDate = new Date();
        return savedDate.getMonth() === currentDate.getMonth() && 
               savedDate.getFullYear() === currentDate.getFullYear();
      });

      // Get current month's transactions
      const transactionQuery = query(
        collection(db, "order_transaction"),
        orderBy("order_date", "desc")
      );
      
      const transactionSnapshot = await getDocs(transactionQuery);
      const currentTransactions = transactionSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(t => {
          const orderDate = new Date(t.order_date.seconds * 1000);
          const currentDate = new Date();
          return orderDate.getMonth() === currentDate.getMonth() && 
                 orderDate.getFullYear() === currentDate.getFullYear();
        });

      if (currentTransactions.length > 0) {
        if (existingRecord) {
          // Update existing record
          await updateDoc(doc(db, "saved_history", existingRecord.id), {
            transactions: currentTransactions,
            lastUpdated: serverTimestamp()
          });
        } else {
          // Create new record only if none exists for this month
          await addDoc(collection(db, "saved_history"), {
            monthYear,
            transactions: currentTransactions,
            dateSaved: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
        }

        // Refresh the list
        await fetchSavedHistories();
      }
    } catch (error) {
      console.error("Error creating/updating monthly save:", error);
    }
  };

  // Add save button click handler
  const handleSaveClick = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const currentMonthYear = currentDate.toLocaleDateString('en-US', { 
        month: 'long',
        year: 'numeric' 
      });

      // Get fresh transactions
      const freshTransactions = await getFreshTransactions(currentMonthYear);
      
      // Update or create record
      await createNewMonthlySave(currentMonthYear, freshTransactions);
      
      // Refresh the list
      await fetchSavedHistories();
    } catch (error) {
      console.error("Error saving:", error);
      alert("Error saving current month. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedHistories();
    checkAndSaveCurrentMonth();
  }, []);

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4 font-latrue">
      <div className="overflow-x-auto">
        <table className="w-full text-[1rem]">
          <thead>
            <tr className="leading-normal border-b-[0.5px] border-b-gray-600/50">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Date Saved</th>
            </tr>
          </thead>
          <tbody>
            {savedHistories.map((history, index) => (
              <tr
                key={index}
                className="hover:bg-yellowsm/20 hover:shadow-sm border-b-[0.5px] border-yellowsm/50"
              >
                <td className="py-3 px-6 text-left">
                  {`${history.monthYear}.pdf`}
                </td>
                <td className="py-3 px-6 text-left">
                  {history.dateSaved}
                </td>
                <td className="py-3 px-6 text-center">
                  <button
                    onClick={() => handleRowClick(history)}
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

      {loading && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
            <p className="mt-2 text-sm">Processing...</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default SavedHistory;
