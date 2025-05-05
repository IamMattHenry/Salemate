import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { collection, query, where, Timestamp, getFirestore, onSnapshot } from 'firebase/firestore';
import PropTypes from 'prop-types';
import firebaseApp from "../../../firebaseConfig";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";
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

// Add constants for product names
const PRODUCTS = {
  CLASSIC: 'Classic Katsu',
  SPICY: 'Spicy Katsu'
};

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

const CardOverallProf = memo(({ label, subLabel, amount }) => (
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
            <span className="font-semibold text-gray-800">₱{(parseInt(amount.replace(/[₱,]/g, '')) / 4).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Active Weeks:</span>
            <span className="font-semibold text-gray-800">4 weeks</span>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const TopSellingCard = memo(({ label, subLabel, products, quantities }) => {
  const topSellingProduct = Object.entries(quantities)
    .sort(([,a], [,b]) => b - a)[0]?.[0];

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellowsm/20 w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-yellowsm/20 p-2 rounded-lg">🏆</span>
          <span className="text-lg md:text-xl font-bold text-gray-800">{label}</span>
        </div>
        <div className="text-sm text-gray-600">{subLabel}</div>
      </div>
      <div className="space-y-3">
        {Object.entries(products).map(([name, amount]) => (
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
                {name === topSellingProduct && (
                  <span className="text-amber-600 text-xs px-2 py-1 bg-amber-100 rounded-full font-medium">
                    Best Seller
                  </span>
                )}
              </div>
              <div className="text-gray-600 text-sm mt-1">
                Sold: {quantities[name] || 0}x
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
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-gray-600">Classic Katsu:</div>
                      <div className="font-semibold text-gray-800">₱{data[PRODUCTS.CLASSIC].toLocaleString()}</div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-gray-600">Spicy Katsu:</div>
                      <div className="font-semibold text-gray-800">₱{data[PRODUCTS.SPICY].toLocaleString()}</div>
                    </div>
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
  amount: PropTypes.string.isRequired
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
  const [topSellingProducts, setTopSellingProducts] = useState({
    [PRODUCTS.CLASSIC]: 0,
    [PRODUCTS.SPICY]: 0
  });
  const [productQuantities, setProductQuantities] = useState({
    [PRODUCTS.CLASSIC]: 0,
    [PRODUCTS.SPICY]: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
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

  useEffect(() => {
    let isSubscribed = true;
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const ordersRef = collection(db, 'order_transaction');
    const monthQuery = query(
      ordersRef,
      where('order_date', '>=', Timestamp.fromDate(firstDay)),
      where('order_date', '<=', Timestamp.fromDate(lastDay))
    );

    const unsubscribe = onSnapshot(monthQuery, (snapshot) => {
      if (!isSubscribed) return;

      try {
        const sales = [];
        let totalMonthSales = 0;
        const weekTotals = [0, 0, 0, 0];
        const productSales = {
          [PRODUCTS.CLASSIC]: 0,
          [PRODUCTS.SPICY]: 0
        };
        const productQty = {
          [PRODUCTS.CLASSIC]: 0,
          [PRODUCTS.SPICY]: 0
        };
        const productWeekSales = [
          { [PRODUCTS.CLASSIC]: 0, [PRODUCTS.SPICY]: 0 },
          { [PRODUCTS.CLASSIC]: 0, [PRODUCTS.SPICY]: 0 },
          { [PRODUCTS.CLASSIC]: 0, [PRODUCTS.SPICY]: 0 },
          { [PRODUCTS.CLASSIC]: 0, [PRODUCTS.SPICY]: 0 }
        ];

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.order_status === 'Delivered' && data.items) {
            const orderDate = data.order_date.toDate();
            const weekNum = getWeekNumber(orderDate);
            
            weekTotals[weekNum] += data.order_total;
            totalMonthSales += data.order_total;

            // Process items array
            data.items.forEach(item => {
              // Check item title for product type
              if (item.title === "Katsu") {
                productSales[PRODUCTS.CLASSIC] += item.subtotal;
                productQty[PRODUCTS.CLASSIC] += item.quantity;
                productWeekSales[weekNum][PRODUCTS.CLASSIC] += item.subtotal;
              } else if (item.title === "Spicy Katsu") {
                productSales[PRODUCTS.SPICY] += item.subtotal;
                productQty[PRODUCTS.SPICY] += item.quantity;
                productWeekSales[weekNum][PRODUCTS.SPICY] += item.subtotal;
              }
            });
            
            sales.push(data);
          }
        });

        // Sort products by sales volume
        const sortedProducts = Object.entries(productSales)
          .sort(([,a], [,b]) => b - a)
          .reduce((obj, [key, value]) => ({
            ...obj,
            [key]: value
          }), {});

        console.log('Product Sales:', productSales);
        console.log('Product Quantities:', productQty);

        // Prepare chart data
        const chartData = [
          { 
            name: 'Week 1', 
            sales: weekTotals[0],
            [PRODUCTS.CLASSIC]: productWeekSales[0][PRODUCTS.CLASSIC] || 0,
            [PRODUCTS.SPICY]: productWeekSales[0][PRODUCTS.SPICY] || 0
          },
          { 
            name: 'Week 2', 
            sales: weekTotals[1],
            [PRODUCTS.CLASSIC]: productWeekSales[1][PRODUCTS.CLASSIC] || 0,
            [PRODUCTS.SPICY]: productWeekSales[1][PRODUCTS.SPICY] || 0
          },
          { 
            name: 'Week 3', 
            sales: weekTotals[2],
            [PRODUCTS.CLASSIC]: productWeekSales[2][PRODUCTS.CLASSIC] || 0,
            [PRODUCTS.SPICY]: productWeekSales[2][PRODUCTS.SPICY] || 0
          },
          { 
            name: 'Week 4', 
            sales: weekTotals[3],
            [PRODUCTS.CLASSIC]: productWeekSales[3][PRODUCTS.CLASSIC] || 0,
            [PRODUCTS.SPICY]: productWeekSales[3][PRODUCTS.SPICY] || 0
          }
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
    <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block">
      <AnalyticsDataHeader sectionHeader={sectionHeader} />
      <div className="my-4 mx-7 w-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <CardOverallProf 
            label={`${currentMonth} Overall Profit`} 
            subLabel="Week 1 - 4 total sale" 
            amount={`₱${monthlyTotal.toLocaleString()}`} 
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
