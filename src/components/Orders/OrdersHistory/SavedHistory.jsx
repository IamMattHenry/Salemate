import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import firebaseApp from "../../../firebaseConfig";

const SavedHistory = () => {
  const [loading, setLoading] = useState(false);
  const [savedHistories, setSavedHistories] = useState([]);
  const db = getFirestore(firebaseApp);

  // Fetch saved histories from Firestore
  const fetchSavedHistories = async () => {
    try {
      const historyQuery = query(
        collection(db, "order_transaction"),
        orderBy("order_date", "desc")
      );
      
      const querySnapshot = await getDocs(historyQuery);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Group by month/year
      const grouped = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.order_date.seconds * 1000);
        const key = date.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
        
        if (!acc[key]) {
          acc[key] = {
            monthYear: key,
            transactions: [],
            dateSaved: date.toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: '2-digit'
            })
          };
        }
        acc[key].transactions.push(transaction);
        return acc;
      }, {});

      setSavedHistories(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching histories:", error);
    }
  };

  useEffect(() => {
    fetchSavedHistories();
  }, []);

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

  const handleRowClick = (history) => {
    generatePDF(history.monthYear, history.transactions);
  };

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4">
      <div className="overflow-x-auto">
        <table className="w-full text-[1rem]">
          <thead>
            <tr className="leading-normal border-b border-b-gray-600/50">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Date Saved</th>
            </tr>
          </thead>
          <tbody>
            {savedHistories.map((history, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(history)}
                className="hover:bg-yellowsm/30 hover:shadow-sm border-b border-yellowsm/50 cursor-pointer"
              >
                <td className="py-3 px-6 text-left">
                  {`${history.monthYear}.pdf`}
                </td>
                <td className="py-3 px-6 text-left">
                  {history.dateSaved}
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
            <p className="mt-2 text-sm">Generating PDF...</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default SavedHistory;
