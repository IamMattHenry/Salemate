import React, { memo } from "react";
import PropTypes from 'prop-types';
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";
import { useAnalytics } from "../../../context/AnalyticsContext";
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

  // Find the top selling product by quantity, not sales amount
  const sortedByQuantity = Object.entries(quantitiesToDisplay).sort(([,a], [,b]) => b - a);
  const topSellingProduct = sortedByQuantity[0]?.[0] || "No sales yet";

  // Sort products by quantity for display purposes (not by price)
  const sortedProducts = sortedByQuantity;

  // Limit to top 5 products for display (sorted by quantity but showing price values)
  const topProducts = sortedProducts.slice(0, 5).reduce((obj, [key]) => {
    // Use the product name (key) to get the price value from productsToDisplay
    obj[key] = productsToDisplay[key];
    return obj;
  }, {});

  // Debug logs removed to prevent console spam

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
                  {name === topSellingProduct && quantitiesToDisplay[name] > 0 && (
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
  // Use the analytics context
  const {
    weeklyTotals,
    monthlyTotal,
    topSellingProducts,
    productQuantities,
    loading,
    chartData,
    currentMonth,
    dataFetched
  } = useAnalytics();

  // Create section header
  const sectionHeader = {
    label: "Monthly Statistics",
    date: currentMonth
  };

  // Debug logs removed to prevent console spam

  if (loading) {
    return (
      <section className="bg-white rounded-2xl shadow-feat w-full mx-auto block p-5">
        <AnalyticsDataHeader sectionHeader={sectionHeader} />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellowsm mb-4"></div>
            <div className="text-lg font-medium text-gray-700">Loading monthly statistics...</div>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest data</p>
          </div>
        </div>
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
