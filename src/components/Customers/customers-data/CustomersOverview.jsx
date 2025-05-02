import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  orderBy,
  where,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import firebaseApp from "../../../firebaseConfig";
import CustomersNav from "../CustomersNav";

const CustomersOverview = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(firebaseApp);

  // Simplified date formatter
  const formatDate = useCallback((date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return {
      display: d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      short: d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
  }, []);

  // Add this new formatter function after your existing formatDate function
  const formatCustomerId = useCallback((id) => {
    if (!id) return '';
    // Convert to string and pad with leading zeros if needed
    const idString = id.toString().padStart(6, '0');
    // Split into groups and join with hyphens
    const firstTwo = idString.slice(0, 2);
    const lastFour = idString.slice(2);
    return `${firstTwo}-${lastFour}`;
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const ordersQuery = query(
        collection(db, "order_transaction"),
        where("order_date", ">=", oneMonthAgo),
        orderBy("order_date", "desc"),
        limit(100)
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const customerMetrics = new Map();

      // Process orders
      ordersSnapshot.docs.forEach(doc => {
        const order = doc.data();
        const customerId = order.customer_id;
        const orderDate = order.order_date.toDate();

        if (!customerMetrics.has(customerId)) {
          customerMetrics.set(customerId, {
            recipient: order.recipient,
            customerId,
            monthlyOrders: 0,
            monthlySpent: 0,
            lastDateOrdered: orderDate
          });
        }

        const customer = customerMetrics.get(customerId);
        if (order.order_status !== "Cancelled") {
          customer.monthlyOrders++;
          customer.monthlySpent += Number(order.order_total || 0);
        }

        if (orderDate > customer.lastDateOrdered) {
          customer.lastDateOrdered = orderDate;
        }
      });

      const processedCustomers = Array.from(customerMetrics.values())
        .map(customer => ({
          ...customer,
          status: isCustomerActive(customer.lastDateOrdered) ? 'Active' : 'Inactive'
        }))
        .sort((a, b) => b.monthlySpent - a.monthlySpent);

      setCustomers(processedCustomers);
      setFilteredCustomers(processedCustomers);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  const isCustomerActive = useCallback((lastOrderDate) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return lastOrderDate >= sevenDaysAgo;
  }, []);

  const handleSearch = useCallback((searchQuery) => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = customers.filter(customer => 
      customer.recipient.toLowerCase().includes(query) ||
      customer.customerId.toString().includes(query) ||
      formatDate(customer.lastDateOrdered).display.toLowerCase().includes(query)
    );
    setFilteredCustomers(filtered);
  }, [customers, formatDate]);

  // Update interval to 5 minutes instead of 1
  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [fetchCustomers]);

  return (
    <div className="w-full">
      <CustomersNav onSearch={handleSearch} />
      <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4 pb-5 font-lato">
        <div className="h-15 w-full rounded-xl text-xl font-semibold grid grid-cols-6 gap-x-4 items-center px-4 pt-7 pb-3">
          <h1 className="text-center">Recipient</h1>
          <h1 className="text-center">Customer ID</h1>
          <h1 className="text-center">Monthly Orders</h1>
          <h1 className="text-center">Total Spent</h1>
          <h1 className="text-center">Last Date Ordered</h1>
          <h1 className="text-center">Status</h1>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-4">No matching customers found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.customerId}
                className="grid grid-cols-6 gap-x-4 items-center px-4 py-5 hover:bg-yellowsm/20 hover:shadow-sm transition-colors text-[1rem]"
              >
                <p className="text-center">{customer.recipient}</p>
                <p className="text-center">{formatCustomerId(customer.customerId)}</p>
                <p className="text-center">{customer.monthlyOrders}</p>
                <p className="text-center">₱ {customer.monthlySpent.toLocaleString()}</p>
                <p className="text-center">{formatDate(customer.lastDateOrdered).short}</p>
                <p className={`text-center ${customer.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                  {customer.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomersOverview;
