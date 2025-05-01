import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import firebaseApp from "../../../firebaseConfig";

const CustomersOverview = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const isCustomerActive = (lastOrderDate) => {
    const now = new Date();
    const twoDaysAgo = new Date(now.setDate(now.getDate() - 2));
    return lastOrderDate.toDate() > twoDaysAgo;
  };

  const formatCustomerId = (id) => {
    if (!id) return '';
    const idString = id.toString();
    if (idString.length >= 6) {
      return `${idString.slice(0, 2)}-${idString.slice(2)}`;
    }
    return idString;
  };

  const fetchCustomers = async () => {
    try {
      const ordersQuery = query(
        collection(db, "order_transaction"),
        orderBy("order_date", "desc")
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(order => order.order_status !== "Cancelled");

      // Get current month's start and end dates
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const customerMetrics = orders.reduce((acc, order) => {
        const customerId = order.customer_id;
        const orderDate = order.order_date.toDate();
        
        if (!acc[customerId]) {
          acc[customerId] = {
            recipient: order.recipient,
            customerId: formatCustomerId(order.customer_id),
            monthlyOrders: 0,
            monthlySpent: 0, // New field for monthly spending
            lastDateOrdered: order.order_date,
            status: isCustomerActive(order.order_date)
          };
        }

        // Only count orders and spending for current month
        if (orderDate >= startOfMonth && orderDate <= endOfMonth) {
          acc[customerId].monthlyOrders += 1;
          if (order.order_status === "Delivered") {
            acc[customerId].monthlySpent += Number(order.order_total || 0);
          }
        }

        // Update latest order info
        if (orderDate > acc[customerId].lastDateOrdered.toDate()) {
          acc[customerId].lastDateOrdered = order.order_date;
        }

        return acc;
      }, {});

      const customersData = Object.values(customerMetrics)
        .map(customer => ({
          ...customer,
          averageSpent: customer.monthlyOrders > 0 
            ? Math.round(customer.monthlySpent / customer.monthlyOrders)
            : 0,
          lastDateOrdered: customer.lastDateOrdered.toDate().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
          }),
          rawDate: customer.lastDateOrdered.toDate(), // Keep raw date for sorting
          status: customer.status ? "Active" : "Inactive"
        }))
        .sort((a, b) => {
          // Sort by status first (Active before Inactive)
          if (a.status !== b.status) {
            return a.status === "Active" ? -1 : 1;
          }
          // Then sort by average spent (highest to lowest)
          if (b.averageSpent !== a.averageSpent) {
            return b.averageSpent - a.averageSpent;
          }
          // Finally sort by date (most recent first)
          return b.rawDate - a.rawDate;
        });

      setCustomers(customersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4 pb-5 font-lato">
      {/* Header Row */}
      <div className="h-15 w-full rounded-xl text-xl font-semibold grid grid-cols-6 gap-x-4 items-center px-4 pt-7 pb-3">
        <h1>Recipient</h1>
        <h1>Customer ID</h1>
        <h1>Monthly Orders</h1>
        <h1>Average Spent</h1>
        <h1>Last Date Ordered</h1>
        <h1>Status</h1>
      </div>

      {/* Data Rows */}
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        customers.map((customer, idx) => (
          <div
            key={idx}
            className="grid grid-cols-6 gap-x-4 items-center px-4 py-3 hover:bg-amber-100/50 transition-colors border-t border-gray-200 text-sm"
          >
            <p>{customer.recipient}</p>
            <p>{customer.customerId}</p>
            <p>{customer.monthlyOrders}</p>
            <p>₱{customer.averageSpent}</p>
            <p>{customer.lastDateOrdered}</p>
            <p className={customer.status === 'Active' ? 'text-green-600' : 'text-red-600'}>
              {customer.status}
            </p>
          </div>
        ))
      )}
    </section>
  );
};

export default CustomersOverview;
