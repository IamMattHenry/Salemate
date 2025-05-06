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

  // Update the fetchCustomers function to show today's data
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get today's start and end
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      const ordersQuery = query(
        collection(db, "order_transaction"),
        where("order_date", ">=", startOfDay),
        where("order_date", "<=", endOfDay),
        orderBy("order_date", "desc")
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

  // Replace the Daily Summary Cards and Customer Table sections
  return (
    <div className="w-full">
      <CustomersNav onSearch={handleSearch} />
      <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4">
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-3 gap-6 p-6">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 shadow-sm border border-amber-100">
            <div className="flex flex-col">
              <p className="text-amber-800/80 text-sm font-medium mb-2">Today's Customers</p>
              <p className="text-3xl font-bold text-amber-900">
                {filteredCustomers.length}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 shadow-sm border border-amber-100">
            <div className="flex flex-col">
              <p className="text-amber-800/80 text-sm font-medium mb-2">Total Orders</p>
              <p className="text-3xl font-bold text-amber-900">
                {filteredCustomers.reduce((sum, c) => sum + c.monthlyOrders, 0)}
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-5 shadow-sm border border-amber-100">
            <div className="flex flex-col">
              <p className="text-amber-800/80 text-sm font-medium mb-2">Total Sales</p>
              <p className="text-3xl font-bold text-amber-900">
                ₱{filteredCustomers.reduce((sum, c) => sum + c.monthlySpent, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Modern Customer Table */}
        <div className="px-6 pb-6">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-amber-100/50 to-amber-50/30 rounded-t-xl p-4">
            <div className="grid grid-cols-4 gap-4">
              <h2 className="font-medium text-amber-900 pl-2">Customer</h2>
              <h2 className="font-medium text-amber-900 text-center">Orders Today</h2>
              <h2 className="font-medium text-amber-900 text-center">Total Spent</h2>
              <h2 className="font-medium text-amber-900 text-center">Status</h2>
            </div>
          </div>

          {/* Scrollable Table Body */}
          <div className="max-h-[calc(100vh-380px)] overflow-y-auto rounded-b-xl border border-amber-100/50">
            {loading ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"/>
                <p className="text-sm text-amber-800/60 mt-3">Loading customers...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm">
                <p className="text-amber-800/60">No customers today</p>
              </div>
            ) : (
              <div className="divide-y divide-amber-100/50">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.customerId}
                    className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-amber-50/50 transition-all duration-200"
                  >
                    <div className="pl-2">
                      <p className="font-medium text-amber-900">{customer.recipient}</p>
                      <p className="text-xs text-amber-700/60">{formatCustomerId(customer.customerId)}</p>
                    </div>
                    <div className="flex justify-center">
                      <p className="font-medium text-amber-900">{customer.monthlyOrders}</p>
                    </div>
                    <div className="flex justify-center">
                      <p className="text-amber-900">₱{customer.monthlySpent.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-center">
                      <span 
                        className={`
                          px-3 py-1 rounded-full text-xs font-medium w-20 text-center
                          ${customer.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-700/20' 
                            : 'bg-red-100 text-red-700 ring-1 ring-red-700/20'}
                        `}
                      >
                        {customer.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomersOverview;
