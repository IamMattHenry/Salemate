import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import firebaseApp from "../../../firebaseConfig";
import CustomersNav from "../CustomersNav"; // Add this import

const CustomersOverview = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const isCustomerActive = (lastOrderDate) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.setDate(now.getDate() - 7)); // Changed from 2 to 7 days
    return lastOrderDate.toDate() > oneWeekAgo;
  };

  const formatCustomerId = (id) => {
    if (!id) return '';
    const idString = id.toString();
    if (idString.length >= 6) {
      return `${idString.slice(0, 2)}-${idString.slice(2)}`;
    }
    return idString;
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    // Handle both string dates and Firestore Timestamps
    const d = typeof date === 'string' ? new Date(date) : 
              date.toDate ? date.toDate() : date;
    
    // Different date formats
    const formats = {
      display: d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }), // April 30, 2025
      searchable: [
        d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }), // April 30, 2025
        d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }), // Apr 30, 2025
        `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}` // 04/30/25
      ]
    };
    
    return formats;
  };

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(customer => {
      // Name match
      const nameMatch = customer.recipient.toLowerCase().includes(query);
      
      // ID match (with and without hyphen)
      const idWithoutHyphen = customer.customerId.replace('-', '');
      const queryWithoutHyphen = query.replace('-', '');
      const idMatch = customer.customerId.toLowerCase().includes(query) || 
                     idWithoutHyphen.includes(queryWithoutHyphen);
      
      // Date match using multiple formats
      const dateFormats = formatDate(new Date(customer.lastDateOrdered));
      const dateMatch = dateFormats.searchable.some(format => 
        format.toLowerCase().includes(query)
      );

      return nameMatch || idMatch || dateMatch;
    });

    setFilteredCustomers(filtered);
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
            monthlySpent: 0,
            lastDateOrdered: order.order_date,
            status: isCustomerActive(order.order_date)
          };
        }

        if (orderDate >= startOfMonth && orderDate <= endOfMonth) {
          acc[customerId].monthlyOrders += 1;
          if (order.order_status === "Delivered") {
            acc[customerId].monthlySpent += Number(order.order_total || 0);
          }
        }

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
          lastDateOrdered: formatDate(customer.lastDateOrdered).display,
          rawDate: customer.lastDateOrdered.toDate(),
          status: customer.status ? "Active" : "Inactive"
        }))
        .sort((a, b) => {
          if (a.status !== b.status) {
            return a.status === "Active" ? -1 : 1;
          }
          if (b.averageSpent !== a.averageSpent) {
            return b.averageSpent - a.averageSpent;
          }
          return b.rawDate - a.rawDate;
        });

      setCustomers(customersData);
      setFilteredCustomers(customersData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <CustomersNav onSearch={handleSearch} />
      <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block my-4 pb-5 font-lato">
        <div className="h-15 w-full rounded-xl text-xl font-semibold grid grid-cols-6 gap-x-4 items-center px-4 pt-7 pb-3">
          <h1 className="text-center">Recipient</h1>
          <h1 className="text-center">Customer ID</h1>
          <h1 className="text-center">Monthly Orders</h1>
          <h1 className="text-center">Average Spent</h1>
          <h1 className="text-center">Last Date Ordered</h1>
          <h1 className="text-center">Status</h1>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-4">No matching customers found</div>
        ) : (
          filteredCustomers.map((customer, idx) => (
            <div
              key={idx}
              className="grid grid-cols-6 gap-x-4 items-center px-4 py-5 hover:bg-yellowsm/20 hover:shadow-lg transition-colors border-t border-gray-200 text-[1rem]"
            >
              <p className="text-center">{customer.recipient}</p>
              <p className="text-center">{customer.customerId}</p>
              <p className="text-center">{customer.monthlyOrders}</p>
              <p className="text-center">₱{customer.averageSpent}</p>
              <p className="text-center" title={formatDate(customer.lastDateOrdered).display}>
                {formatDate(customer.lastDateOrdered).searchable[1]} {/* Using the short month format */}
              </p>
              <p className={`text-center ${customer.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                {customer.status}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CustomersOverview;
