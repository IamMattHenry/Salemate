import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { collection, query, where, Timestamp, getFirestore, onSnapshot, orderBy } from 'firebase/firestore';
import PropTypes from 'prop-types';
import firebaseApp from "../../../firebaseConfig";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";
import { fetchProducts } from "../../../services/productService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Constants
const WEEK_LABELS = {
  WEEK_1: 'Week 1',
  WEEK_2: 'Week 2',
  WEEK_3: 'Week 3',
  WEEK_4: 'Week 4'
};

const SUB_LABEL = 'Total profit each week';
const TOP_SELLING_LABEL = "Week 1 - 4 overall top selling product";

// Memoized Card Components
const Card = memo(({ label, subLabel, amount }) => (
  <div className="bg-gradient-to-br from-yellowsm/10 to-yellowsm/20 h-32 w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4">
    <div className="h-full flex flex-col justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="bg-yellowsm/20 p-1.5 rounded-lg text-sm">📅</span>
          <span className="text-lg font-bold text-gray-800">{label}</span>
        </div>
        <div className="text-sm text-gray-600">{subLabel}</div>
      </div>
      <div className="text-2xl font-bold text-yellowsm text-right">{amount}</div>
    </div>
  </div>
));

const CardOverallProf = memo(({ label, subLabel, amount, weeklyTotals }) => {
  // Calculate average weekly sales and active weeks
  const activeWeeks = weeklyTotals ? weeklyTotals.filter(total => total > 0).length : 0;
  const totalSales = weeklyTotals ? weeklyTotals.reduce((sum, total) => sum + total, 0) : 0;
  const averageWeeklySales = activeWeeks > 0 ? Math.round(totalSales / activeWeeks) : 0;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellowsm/20 w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <div className="h-full flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-yellowsm/20 p-2 rounded-lg">💰</span>
            <span className="text-lg md:text-xl font-bold text-gray-800">{label}</span>
          </div>
          <div className="text-sm text-gray-600">{subLabel}</div>
        </div>
        <div className="mt-4">
          <div className="text-4xl font-bold text-yellowsm text-right">{amount}</div>
          <div className="text-sm text-gray-600 text-right mt-1">Total Revenue</div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Average Weekly Sales:</span>
              <span className="font-semibold text-gray-800">₱{averageWeeklySales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-600">Active Weeks:</span>
              <span className="font-semibold text-gray-800">{activeWeeks} {activeWeeks === 1 ? 'week' : 'weeks'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const TopSellingCard = memo(({ label, subLabel, products, quantities }) => {
  // Make sure we have products to display
  const productsToDisplay = Object.keys(products).length > 0 ? products : {
    "Katsu": 0,
    "Spicy Katsu": 0,
    "Apple Pie": 0,
    "Iced Coffee": 0,
    "Milk Tea": 0
  };

  // Make sure we have quantities to display
  const quantitiesToDisplay = Object.keys(quantities).length > 0 ? quantities : {
    "Katsu": 0,
    "Spicy Katsu": 0,
    "Apple Pie": 0,
    "Iced Coffee": 0,
    "Milk Tea": 0
  };

  // Find the top selling product by sales amount, not quantity
  const sortedProducts = Object.entries(productsToDisplay).sort(([,a], [,b]) => b - a);
  const topSellingProduct = sortedProducts[0]?.[0] || "No sales yet";

  // Limit to top 5 products for display
  const topProducts = sortedProducts.slice(0, 5).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});

  console.log("Top selling product:", topSellingProduct);
  console.log("Products to display:", topProducts);
  console.log("All quantities:", quantitiesToDisplay);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellowsm/20 w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-yellowsm/20 p-2 rounded-lg">🏆</span>
          <span className="text-lg md:text-xl font-bold text-gray-800">{label}</span>
        </div>
        <div className="text-sm text-gray-600">{subLabel}</div>
      </div>
      {/* Fixed height container with scrolling */}
      <div className="h-[140px] overflow-y-auto pr-1 custom-scrollbar">
        <div className="space-y-3">
          {Object.entries(topProducts).map(([name, amount]) => (
            <div
              key={name}
              className={`flex justify-between items-start p-3 rounded-lg transition-all duration-200
                ${name === topSellingProduct
                  ? 'bg-gradient-to-r from-amber-50 to-amber-100/30 shadow-sm'
                  : 'hover:bg-amber-50/30'}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`${name === topSellingProduct ? 'font-bold text-amber-700' : 'text-gray-700'}`}>
                    {name}
                  </span>
                  {name === topSellingProduct && amount > 0 && (
                    <span className="text-amber-600 text-xs px-2 py-1 bg-amber-100 rounded-full font-medium">
                      Best Seller
                    </span>
                  )}
                </div>
                <div className="text-gray-600 text-sm mt-1">
                  Sold: {quantitiesToDisplay[name] || 0}x
                </div>
              </div>
              <div className={`${name === topSellingProduct
                ? 'text-amber-700 font-bold text-xl'
                : 'text-gray-700'} text-right ml-4`}>
                ₱{amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const SalesBarChart = memo(({ data }) => (
  <div className="bg-gradient-to-br from-yellowsm/10 to-yellowsm/20 w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
    <div className="flex items-center gap-2 mb-6">
      <span className="bg-yellowsm/20 p-2 rounded-lg">📈</span>
      <div>
        <div className="text-xl font-bold text-gray-800">Weekly Sales Breakdown</div>
        <div className="text-sm text-gray-600">Revenue performance per week</div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E5E7EB"
          opacity={0.5}
        />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
          dy={10}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => `₱${value.toLocaleString()}`}
          dx={-10}
        />
        <Tooltip
          cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white p-4 shadow-lg rounded-lg border border-yellowsm/20">
                  <div className="font-bold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                    {data.name} Performance
                  </div>
                  <div className="space-y-2">
                    {Object.entries(data)
                      .filter(([key]) => key !== 'name' && key !== 'sales')
                      .map(([productName, amount]) => (
                        <div key={productName} className="flex items-center justify-between gap-4">
                          <div className="text-gray-600">{productName}:</div>
                          <div className="font-semibold text-gray-800">₱{amount.toLocaleString()}</div>
                        </div>
                      ))
                    }
                    <div className="pt-2 mt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-bold text-gray-800">Total Sales:</div>
                        <div className="font-bold text-yellowsm">₱{data.sales.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar
          dataKey="sales"
          fill="url(#salesGradient)"
          radius={[6, 6, 0, 0]}
          maxBarSize={60}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.sales > 0 ? 'url(#salesGradient)' : '#F3F4F6'}
              className="hover:opacity-80 transition-opacity duration-200"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
));

// PropTypes
Card.propTypes = {
  label: PropTypes.string.isRequired,
  subLabel: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired
};

CardOverallProf.propTypes = {
  label: PropTypes.string.isRequired,
  subLabel: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  weeklyTotals: PropTypes.arrayOf(PropTypes.number)
};

TopSellingCard.propTypes = {
  label: PropTypes.string.isRequired,
  subLabel: PropTypes.string.isRequired,
  products: PropTypes.object.isRequired,
  quantities: PropTypes.object.isRequired
};

SalesBarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      sales: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// Error Boundary
class ProductSalesErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ProductSales Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-2xl shadow-feat w-full mx-auto block p-5">
          Something went wrong loading sales data.
        </div>
      );
    }
    return this.props.children;
  }
}

const ProductSales = () => {
  const [weeklyTotals, setWeeklyTotals] = useState([0, 0, 0, 0]);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [topSellingProducts, setTopSellingProducts] = useState({});
  const [productQuantities, setProductQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const db = getFirestore(firebaseApp);

  const currentMonth = useMemo(() =>
    new Date().toLocaleString('default', { month: 'long' })
  , []);

  const getWeekNumber = useCallback((date) => {
    // Get the first day of the month
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    // Get the date being checked
    const dayOfMonth = date.getDate();

    // Calculate which week the date falls into (1-based)
    const weekNumber = Math.ceil((dayOfMonth + firstDay.getDay()) / 7);

    // Convert to 0-based index and ensure it doesn't exceed 3 (4th week)
    return Math.min(weekNumber - 1, 3);
  }, []);

  const sectionHeader = useMemo(() => ({
    label: "Monthly Statistics",
    date: currentMonth
  }), [currentMonth]);

  // Fetch all products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await fetchProducts();
        setAllProducts(productsData);

        // Initialize empty product sales and quantities objects
        const initialProductSales = {};
        const initialProductQuantities = {};

        // Add some default products in case there are no products in the database
        // or in case the order items don't match exactly with product titles
        const defaultProducts = [
          "Katsu",
          "Spicy Katsu",
          "Apple Pie",
          "Iced Coffee",
          "Milk Tea"
        ];

        // Add all products from the database
        productsData.forEach(product => {
          if (product.title) {
            initialProductSales[product.title] = 0;
            initialProductQuantities[product.title] = 0;
          }
        });

        // Add default products if they don't exist
        defaultProducts.forEach(title => {
          if (!initialProductSales[title]) {
            initialProductSales[title] = 0;
            initialProductQuantities[title] = 0;
          }
        });

        // Make sure we have at least one product
        if (Object.keys(initialProductSales).length === 0) {
          defaultProducts.forEach(title => {
            initialProductSales[title] = 0;
            initialProductQuantities[title] = 0;
          });
        }

        setTopSellingProducts(initialProductSales);
        setProductQuantities(initialProductQuantities);

        console.log("Initialized product sales:", initialProductSales);
        console.log("Fetched products:", productsData.map(p => p.title));
      } catch (error) {
        console.error("Error fetching products:", error);

        // Fallback to default products if there's an error
        const defaultProducts = {
          "Katsu": 0,
          "Spicy Katsu": 0,
          "Apple Pie": 0,
          "Iced Coffee": 0,
          "Milk Tea": 0
        };

        setTopSellingProducts(defaultProducts);
        setProductQuantities(defaultProducts);
      }
    };

    loadProducts();
  }, []);

  // Fetch order data
  useEffect(() => {
    let isSubscribed = true;
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    console.log(`Fetching orders from ${firstDay.toISOString()} to ${lastDay.toISOString()}`);

    const ordersRef = collection(db, 'order_transaction');
    // Use a simpler query to get all orders for the month
    const monthQuery = query(
      ordersRef,
      orderBy('order_date')
    );

    const unsubscribe = onSnapshot(monthQuery, (snapshot) => {
      if (!isSubscribed) return;

      try {
        const sales = [];
        let totalMonthSales = 0;
        const weekTotals = [0, 0, 0, 0];

        // Create dynamic product sales and quantities objects based on all products
        const productSales = { ...topSellingProducts };
        const productQty = { ...productQuantities };

        // Initialize product week sales with all products
        const productWeekSales = [
          { ...productSales },
          { ...productSales },
          { ...productSales },
          { ...productSales }
        ];

        // Filter orders for the current month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        console.log(`Current month: ${firstDay.toLocaleDateString()} to ${lastDay.toLocaleDateString()}`);

        snapshot.forEach((doc) => {
          const data = doc.data();

          // Skip if no items or no order_date
          if (!data.items || !data.order_date) {
            console.log('Skipping order - missing items or order_date:', doc.id);
            return;
          }

          // Convert Firestore timestamp to Date
          const orderDate = data.order_date.toDate ? data.order_date.toDate() : new Date(data.order_date);

          // Check if order is in the current month
          if (orderDate < firstDay || orderDate > lastDay) {
            console.log(`Skipping order ${doc.id} - outside current month: ${orderDate.toLocaleDateString()}`);
            return;
          }

          console.log(`Processing order ${doc.id} from ${orderDate.toLocaleDateString()}, status: ${data.order_status}, total: ${data.order_total}`);

          // Debug log to see all items in each order
          console.log('Order Items:', data.items.map(item => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal || (item.price * item.quantity)
          })));

          const weekNum = getWeekNumber(orderDate);

          // Include all orders regardless of status
          weekTotals[weekNum] += data.order_total || 0;
          totalMonthSales += data.order_total || 0;

          // Process all items dynamically
          data.items.forEach(item => {
            // Get the item title, checking for different property names
            const itemTitle = item.title || item.name || '';

            if (!itemTitle) {
              console.log('Skipping item with no title:', item);
              return;
            }

            // Calculate the total for this item
            // Make sure we're using the correct price calculation
            const itemPrice = parseFloat(item.price) || 0;
            const itemQuantity = parseInt(item.quantity) || 0;
            const itemTotal = parseFloat(item.subtotal) || (itemPrice * itemQuantity);

            console.log(`Processing item: ${itemTitle}, Price: ${itemPrice}, Quantity: ${itemQuantity}, Total: ${itemTotal}`);

            // If this is a new product we haven't seen before, add it to our tracking
            if (!productSales.hasOwnProperty(itemTitle)) {
              console.log(`Adding new product to tracking: ${itemTitle}`);
              productSales[itemTitle] = 0;
              productQty[itemTitle] = 0;

              // Add to all week sales tracking
              for (let i = 0; i < 4; i++) {
                productWeekSales[i][itemTitle] = 0;
              }
            }

            // Update product sales
            productSales[itemTitle] += itemTotal;

            // Update product quantities
            productQty[itemTitle] += itemQuantity;

            // Update weekly product sales
            productWeekSales[weekNum][itemTitle] += itemTotal;
          });
        });

        // Add console logs for debugging
        console.log('Weekly Product Sales:', productWeekSales);
        console.log('Product Names in Orders:', new Set([...snapshot.docs.flatMap(doc => doc.data().items.map(item => item.title))]));

        // Log all order items for debugging
        console.log('All Order Items:', snapshot.docs.flatMap(doc => {
          const data = doc.data();
          return data.items ? data.items.map(item => ({
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal || (item.price * item.quantity)
          })) : [];
        }));

        // Sort products by sales volume
        const sortedProducts = Object.entries(productSales)
          .sort(([,a], [,b]) => b - a)
          .reduce((obj, [key, value]) => ({
            ...obj,
            [key]: value
          }), {});

        console.log('Product Sales:', productSales);
        console.log('Product Quantities:', productQty);

        // Log the top selling product
        const topProduct = Object.entries(productSales).sort(([,a], [,b]) => b - a)[0];
        console.log('Top Selling Product:', topProduct ? `${topProduct[0]} - ₱${topProduct[1]}` : 'None');

        // Prepare chart data dynamically
        const chartData = [
          { name: 'Week 1', sales: weekTotals[0], ...productWeekSales[0] },
          { name: 'Week 2', sales: weekTotals[1], ...productWeekSales[1] },
          { name: 'Week 3', sales: weekTotals[2], ...productWeekSales[2] },
          { name: 'Week 4', sales: weekTotals[3], ...productWeekSales[3] }
        ];

        setWeeklyTotals(weekTotals);
        setMonthlyTotal(totalMonthSales);
        setTopSellingProducts(sortedProducts);
        setProductQuantities(productQty);
        setChartData(chartData);

      } catch (error) {
        console.error("Error processing sales data:", error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      if (!isSubscribed) return;
      console.error("Error fetching monthly sales:", error);
      setLoading(false);
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [db, getWeekNumber]);

  if (loading) {
    return (
      <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block p-5">
        <div>Loading monthly statistics...</div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow-feat w-full overflow-auto h-110 mx-auto block">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="my-4 mx-7 w-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <CardOverallProf
            label={`${currentMonth} Overall Profit`}
            subLabel="Week 1 - 4 total sale"
            amount={`₱${monthlyTotal.toLocaleString()}`}
            weeklyTotals={weeklyTotals}
          />
          <TopSellingCard
            label={`${currentMonth} Top Selling Product`}
            subLabel={TOP_SELLING_LABEL}
            products={topSellingProducts}
            quantities={productQuantities}
          />
        </div>
        <SalesBarChart data={chartData} />
      </div>
    </section>
  );
};

// Wrap the export with ErrorBoundary
export default function ProductSalesWrapper() {
  return (
    <ProductSalesErrorBoundary>
      <ProductSales />
    </ProductSalesErrorBoundary>
  );
}
