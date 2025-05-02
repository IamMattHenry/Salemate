import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { collection, query, where, Timestamp, getFirestore, onSnapshot } from 'firebase/firestore';
import PropTypes from 'prop-types';
import firebaseApp from "../../../firebaseConfig";
import AnalyticsDataHeader from "../analytics-common/AnalyticsDataHeader";

// Constants
const WEEK_LABELS = {
  WEEK_1: 'Week 1',
  WEEK_2: 'Week 2',
  WEEK_3: 'Week 3',
  WEEK_4: 'Week 4'
};

const SUB_LABEL = 'Total profit each week';

// Memoized Card Components
const Card = memo(({ label, subLabel, amount }) => (
  <div className="bg-yellowsm/20 h-40 w-full rounded-xl shadow-md flex flex-row items-center justify-between font-lato px-5">
    <div>
      <div>
        <div className="text-xl font-medium text-left">{label}</div>
        <div className="text-[1rem] text-gray-600 mb-5 -mt-2 text-left">
          {subLabel}
        </div>
      </div>
      <div className="text-xl font-medium">{amount}</div>
    </div>
  </div>
));

const CardOverallProf = memo(({ label, subLabel, amount }) => (
  <div className="bg-yellowsm/20 w-full rounded-xl shadow-md flex flex-row items-center justify-between font-lato px-5 h-40">
    <div>
      <div>
        <div className="text-xl font-medium text-left">{label}</div>
        <div className="text-[1rem] text-gray-600 mb-5 -mt-2 text-left">
          {subLabel}
        </div>
      </div>
      <div className="text-xl font-medium">{amount}</div>
    </div>
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
  const [loading, setLoading] = useState(true);
  const db = getFirestore(firebaseApp);
  
  const currentMonth = useMemo(() => 
    new Date().toLocaleString('default', { month: 'long' })
  , []);
  
  const getWeekNumber = useCallback((date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const daysSinceFirst = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
    const adjustedDay = daysSinceFirst + firstDay.getDay();
    return Math.min(Math.floor(adjustedDay / 7), 3);
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

        snapshot.forEach((doc) => {
          const data = doc.data();
          const orderDate = data.order_date.toDate();
          const weekNum = getWeekNumber(orderDate);
          
          weekTotals[weekNum] += data.order_total;
          totalMonthSales += data.order_total;
          sales.push(data);
        });

        setWeeklyTotals(weekTotals);
        setMonthlyTotal(totalMonthSales);
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
      <div className="my-5 mx-7 w-auto">
        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-6 grid grid-cols-2 gap-4">
            <Card 
              label={WEEK_LABELS.WEEK_1}
              subLabel={SUB_LABEL}
              amount={`₱${weeklyTotals[0].toLocaleString()}`} 
            />
            <Card 
              label={WEEK_LABELS.WEEK_2}
              subLabel={SUB_LABEL}
              amount={`₱${weeklyTotals[1].toLocaleString()}`} 
            />
          </div>
          <div className="col-span-3 row-span-2">
            <CardOverallProf 
              label={`${currentMonth} Overall Profit`} 
              subLabel="Week 1 - 4 total sale" 
              amount={`₱${monthlyTotal.toLocaleString()}`} 
            />
          </div>
          <div className="col-span-6 grid grid-cols-2 gap-4">
            <Card 
              label={WEEK_LABELS.WEEK_3}
              subLabel={SUB_LABEL}
              amount={`₱${weeklyTotals[2].toLocaleString()}`} 
            />
            <Card 
              label={WEEK_LABELS.WEEK_4}
              subLabel={SUB_LABEL}
              amount={`₱${weeklyTotals[3].toLocaleString()}`} 
            />
          </div>
        </div>
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
