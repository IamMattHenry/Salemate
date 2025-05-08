import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  getFirestore,
  where,
  limit,
  updateDoc,
  doc
} from "firebase/firestore";
import firebaseApp from "../../../firebaseConfig";
import { LuDownload } from "react-icons/lu";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

// Get Firestore instance
const db = getFirestore(firebaseApp);

// Helper functions

const getWeekNumber = (date) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDayOfMonth.getDay()) / 7);
};

const AnalyticsSaveHistory = () => {
  const [loading, setLoading] = useState(false);
  const [savedHistories, setSavedHistories] = useState([]);
  const [error, setError] = useState(null);

  // Fetch saved histories
  const fetchSavedHistories = async () => {
    try {
      console.log("Fetching saved histories...");
      setLoading(true);
      setError(null);

      // Simplified approach without timeout race condition
      const historyQuery = query(
        collection(db, "analyticReportSaved"), // Updated collection name
        orderBy("dateSaved", "desc"),
        limit(10) // Limit to 10 most recent histories for better performance
      );

      const snapshot = await getDocs(historyQuery);
      console.log(`Found ${snapshot.size} saved histories`);

      const histories = snapshot.docs.map(doc => {
        const data = doc.data();
        // Handle case where dateSaved might be missing or invalid
        let formattedDate = "Unknown date";
        if (data.dateSaved) {
          if (data.dateSaved.seconds) {
            formattedDate = new Date(data.dateSaved.seconds * 1000).toLocaleDateString();
          } else if (data.dateSaved instanceof Date) {
            formattedDate = data.dateSaved.toLocaleDateString();
          }
        }

        return {
          id: doc.id,
          ...data,
          dateSaved: formattedDate
        };
      });

      setSavedHistories(Array.isArray(histories) ? histories : []);
      console.log("Histories fetched successfully");
      return histories; // Return the histories for use in other functions
    } catch (err) {
      console.error("Error fetching histories:", err);
      setError(`Failed to load analytics history: ${err.message}`);
      // Set empty array to avoid undefined errors
      setSavedHistories([]);
      return []; // Return empty array in case of error
    } finally {
      setLoading(false);
    }
  };

  // Helper function to add page header (for better performance and consistency)
  const addPageHeader = (pdfDoc, primaryColor) => {
    pdfDoc.setFillColor(...primaryColor);
    pdfDoc.rect(0, 0, 210, 25, 'F');
    pdfDoc.setTextColor(255, 255, 255);
    pdfDoc.setFont("helvetica", "bold");
    pdfDoc.setFontSize(18);
    pdfDoc.text("SALEMATE", 15, 15);
    pdfDoc.setFontSize(12);
    pdfDoc.text("ANALYTICS REPORT", 105, 15, { align: "center" });
  };

  // Helper function to calculate weekly breakdown of sales data
  const calculateWeeklyBreakdown = (dailySales, firstDayOfMonth, lastDayOfMonth) => {
    console.log("Calculating weekly breakdown with dailySales:", dailySales);

    // Initialize weekly breakdown structure
    const weeks = [
      { name: "Week 1 (Days 1-7)", sales: 0, orders: 0, days: [] },
      { name: "Week 2 (Days 8-14)", sales: 0, orders: 0, days: [] },
      { name: "Week 3 (Days 15-21)", sales: 0, orders: 0, days: [] },
      { name: "Week 4 (Days 22-28)", sales: 0, orders: 0, days: [] },
      { name: "Week 5 (Days 29-31)", sales: 0, orders: 0, days: [] }
    ];

    // Process each day of the month
    const daysInMonth = lastDayOfMonth.getDate();
    console.log(`Processing ${daysInMonth} days in the month`);

    // Log days with sales for debugging
    Object.entries(dailySales || {}).forEach(([dateKey, data]) => {
      if (data.orders > 0) {
        console.log(`Day with sales: ${dateKey} - Orders: ${data.orders}, Sales: ${data.sales}`);
      }
    });

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), day);

      // Fix timezone issue by using local date formatting instead of UTC
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      const dateKey = localDate.toISOString().split('T')[0];

      console.log(`Day ${day} date: ${date.toLocaleDateString()}, dateKey: ${dateKey}`);

      const dayData = dailySales?.[dateKey] || { orders: 0, sales: 0 };

      // Log for debugging
      if (dayData.orders > 0) {
        console.log(`Processing day ${day} (${dateKey}): Orders=${dayData.orders}, Sales=${dayData.sales}`);
      }

      // Determine which week this day belongs to
      let weekIndex;
      if (day <= 7) weekIndex = 0;
      else if (day <= 14) weekIndex = 1;
      else if (day <= 21) weekIndex = 2;
      else if (day <= 28) weekIndex = 3;
      else weekIndex = 4;

      // Add data to the appropriate week
      weeks[weekIndex].sales += dayData.sales || 0;
      weeks[weekIndex].orders += dayData.orders || 0;
      // Get the correct day of the week based on the actual date
      const correctDate = new Date(date);
      const dayOfWeek = correctDate.toLocaleDateString('en-US', { weekday: 'long' });

      console.log(`Day ${day}: ${dateKey} is a ${dayOfWeek}`);

      weeks[weekIndex].days.push({
        date,
        dateKey,
        dayOfMonth: day,
        dayOfWeek: dayOfWeek,
        orders: dayData.orders || 0,
        sales: dayData.sales || 0
      });
    }

    // Log weekly totals for debugging
    weeks.forEach((week, index) => {
      console.log(`Week ${index + 1}: Orders=${week.orders}, Sales=${week.sales}`);
    });

    // Filter out Week 5 if it has no days (for months with 28 days)
    return weeks.filter(week => week.days.length > 0);
  };

  // Highly optimized PDF generation function for maximum performance
  const generatePDF = async (monthYear, weekData) => {
    setLoading(true);
    try {
      console.log("Starting optimized PDF generation...");
      const startTime = performance.now();

      // Create PDF document with compression and optimized settings
      const pdfDoc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
        precision: 2,
        putOnlyUsedFonts: true,
        floatPrecision: 16 // Use lower precision for better performance
      });

      const today = new Date();

      // Define colors
      const primaryColor = [255, 191, 0]; // Amber
      const secondaryColor = [0, 0, 0]; // Black
      const lightBgColor = [255, 251, 235]; // Light amber
      const textColor = [51, 51, 51]; // Dark gray
      const accentColor = [236, 72, 153]; // Pink for highlights

      // Add logo/header using the helper function
      addPageHeader(pdfDoc, primaryColor);

      // Add date on the right
      pdfDoc.setFontSize(10);
      pdfDoc.text(today.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }), 195, 15, { align: "right" });

      // Add report subtitle for monthly report
      pdfDoc.setTextColor(...textColor);
      pdfDoc.setFontSize(16);
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.text(`Monthly Analytics Summary - ${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 15, 35);

      // Add date range for the entire month
      pdfDoc.setFontSize(10);
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.setTextColor(107, 114, 128);

      // Calculate first and last day of current month
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const monthDateRange = `${firstDayOfMonth.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} - ${lastDayOfMonth.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`;
      pdfDoc.text(`Reporting Period: ${monthDateRange}`, 15, 42);

      // Add summary section
      pdfDoc.setDrawColor(...primaryColor);
      pdfDoc.setFillColor(...lightBgColor);
      pdfDoc.roundedRect(15, 48, 180, 50, 3, 3, 'FD');

      // Add summary title
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(...secondaryColor);
      pdfDoc.text("MONTHLY PERFORMANCE SUMMARY", 20, 55);

      // Add horizontal line
      pdfDoc.setDrawColor(...primaryColor);
      pdfDoc.setLineWidth(0.5);
      pdfDoc.line(20, 58, 190, 58);

      // Calculate some additional metrics for the report
      const totalRevenue = weekData.totalRevenue || 0;
      const totalOrders = weekData.totalOrders || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      console.log("PDF Generation - Total Revenue:", totalRevenue);
      console.log("PDF Generation - Total Orders:", totalOrders);
      console.log("PDF Generation - Daily Sales Data:", weekData.dailySales);

      // Log days with sales for debugging
      Object.entries(weekData.dailySales || {}).forEach(([dateKey, data]) => {
        if (data.orders > 0) {
          console.log(`PDF Generation - Day with sales: ${dateKey} - Orders: ${data.orders}, Sales: ${data.sales}`);
        }
      });

      // Calculate weekly breakdowns
      const weeklyBreakdown = calculateWeeklyBreakdown(weekData.dailySales, firstDayOfMonth, lastDayOfMonth);

      // Find the day with highest sales and calculate per-day metrics
      let highestSalesDay = { day: "N/A", sales: 0 };
      let lowestSalesDay = { day: "N/A", sales: Number.MAX_SAFE_INTEGER };

      // Track daily averages separately
      const dailyAverages = {};

      Object.entries(weekData.dailySales || {}).forEach(([dateKey, data]) => {
        const date = new Date(dateKey);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

        // Calculate average order value for this specific day
        const avgOrderValue = data.orders > 0 ? data.sales / data.orders : 0;
        dailyAverages[dateKey] = avgOrderValue;

        if (data.sales > highestSalesDay.sales) {
          highestSalesDay = { day: dayName, sales: data.sales };
        }

        if (data.sales < lowestSalesDay.sales && data.sales > 0) {
          lowestSalesDay = { day: dayName, sales: data.sales };
        }
      });

      if (lowestSalesDay.sales === Number.MAX_SAFE_INTEGER) {
        lowestSalesDay.sales = 0;
      }

      // Add key metrics in a 2x2 grid
      // Top row
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(14);
      pdfDoc.setTextColor(...secondaryColor);
      pdfDoc.text(`PHP ${totalRevenue.toLocaleString()}`, 40, 70);
      pdfDoc.text(`${totalOrders}`, 140, 70);

      // Top row labels
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(107, 114, 128);
      pdfDoc.text("Total Revenue", 40, 75);
      pdfDoc.text("Total Orders", 140, 75);

      // Bottom row
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(14);
      pdfDoc.setTextColor(...secondaryColor);
      pdfDoc.text(`PHP ${avgOrderValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`, 40, 85);
      pdfDoc.text(`${highestSalesDay.day}`, 140, 85);

      // Bottom row labels
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(107, 114, 128);
      pdfDoc.text("Average Order Value", 40, 90);
      pdfDoc.text("Best Performing Day", 140, 90);

      // Skip monthly sales breakdown - removed as requested

      // Add a simple page footer
      const addPageFooter = () => {
        const pageCount = pdfDoc.internal.getNumberOfPages();
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        pdfDoc.setFontSize(8);
        pdfDoc.setTextColor(150, 150, 150);
        pdfDoc.text(`Generated on ${dateString} | Page ${pageCount}`, 105, pdfDoc.internal.pageSize.height - 10, { align: "center" });
      };

      // Add the footer to the first page
      addPageFooter();

      // Add insights section
      const currentY = 110; // Start insights section right after the summary

      // Check if we need a new page
      if (currentY > 240) {
        pdfDoc.addPage();
        // Use the addPageHeader helper function for consistency and performance
        addPageHeader(pdfDoc, primaryColor);
      }

      // Add insights title
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(...secondaryColor);
      pdfDoc.text("KEY INSIGHTS", 15, currentY > 240 ? 40 : currentY);

      // Add insights content
      const insightsY = currentY > 240 ? 50 : currentY + 10;

      // Create insights box
      pdfDoc.setDrawColor(...primaryColor);
      pdfDoc.setFillColor(...lightBgColor);
      pdfDoc.roundedRect(15, insightsY - 5, 180, 50, 3, 3, 'FD');

      // Add insights
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(...textColor);

      // Calculate the average order value for days with orders
      const daysWithOrders = Object.values(weekData.dailySales || {}).filter(data => data.orders > 0);
      const avgDailyOrderValue = daysWithOrders.length > 0
        ? daysWithOrders.reduce((sum, data) => sum + (data.sales / data.orders), 0) / daysWithOrders.length
        : 0;

      // Calculate weekly performance metrics
      const weeklyPerformance = weeklyBreakdown.map(week => ({
        name: week.name,
        sales: week.sales,
        orders: week.orders,
        avgOrderValue: week.orders > 0 ? week.sales / week.orders : 0
      }));

      // Find best and worst performing weeks
      const bestWeek = weeklyPerformance.reduce((best, week) =>
        week.sales > best.sales ? week : best, { name: "N/A", sales: 0 });

      const worstWeek = weeklyPerformance
        .filter(week => week.sales > 0)
        .reduce((worst, week) =>
          week.sales < worst.sales ? week : worst,
          { name: "N/A", sales: Number.MAX_SAFE_INTEGER });

      if (worstWeek.sales === Number.MAX_SAFE_INTEGER) {
        worstWeek.sales = 0;
      }

      const insights = [
        `• Best performing day was ${highestSalesDay.day} with PHP ${highestSalesDay.sales.toLocaleString()} in sales.`,
        `• Best performing week was ${bestWeek.name} with PHP ${bestWeek.sales.toLocaleString()} in sales.`,
        `• Average daily revenue for days with sales: PHP ${daysWithOrders.length > 0 ? (daysWithOrders.reduce((sum, data) => sum + data.sales, 0) / daysWithOrders.length).toLocaleString(undefined, {maximumFractionDigits: 2}) : '0'}.`,
        `• Average weekly revenue: PHP ${weeklyPerformance.length > 0 ? (weeklyPerformance.reduce((sum, week) => sum + week.sales, 0) / weeklyPerformance.length).toLocaleString(undefined, {maximumFractionDigits: 2}) : '0'}.`,
        `• The average customer spent PHP ${avgDailyOrderValue.toLocaleString(undefined, {maximumFractionDigits: 2})} per order.`
      ];

      insights.forEach((insight, index) => {
        pdfDoc.text(insight, 20, insightsY + (index * 8));
      });

      // Add weekly breakdown section
      const weeklyBreakdownY = insightsY + 55;

      // Check if we need a new page
      if (weeklyBreakdownY > 240) {
        pdfDoc.addPage();
        addPageHeader(pdfDoc, primaryColor);
      }

      // Add weekly breakdown title
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(...secondaryColor);
      pdfDoc.text("WEEKLY PERFORMANCE BREAKDOWN", 15, weeklyBreakdownY > 240 ? 40 : weeklyBreakdownY);

      // Add a note about the current month
      pdfDoc.setFont("helvetica", "italic");
      pdfDoc.setFontSize(9);
      pdfDoc.setTextColor(107, 114, 128);
      pdfDoc.text(`* Detailed breakdown of ${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 15, weeklyBreakdownY > 240 ? 45 : weeklyBreakdownY + 5);

      // Calculate starting Y position for the weekly breakdown (add extra space for the note)
      let currentWeekY = weeklyBreakdownY > 240 ? 55 : weeklyBreakdownY + 15;

      // Get the current day of the month
      const currentDay = today.getDate();

      // Calculate which week of the month we're in (1-4)
      const currentWeekOfMonth = Math.ceil(currentDay / 7);

      // Process each week from our weekly breakdown
      weeklyBreakdown.forEach((week, weekIndex) => {
        // Check if we need a new page
        if (currentWeekY > 240) {
          pdfDoc.addPage();
          addPageHeader(pdfDoc, primaryColor);
          currentWeekY = 40;
        }

        // Add week header (highlight current week)
        pdfDoc.setFont("helvetica", "bold");
        pdfDoc.setFontSize(11);

        // Check if this is the current week
        const isCurrentWeek = weekIndex === (currentWeekOfMonth - 1);

        if (isCurrentWeek) {
          // Highlight current week with a background
          pdfDoc.setDrawColor(...primaryColor);
          pdfDoc.setFillColor(...lightBgColor);
          pdfDoc.roundedRect(10, currentWeekY - 5, 190, 10, 2, 2, 'FD');
          pdfDoc.setTextColor(...accentColor);
          pdfDoc.text(`${week.name} (Current)`, 15, currentWeekY);
        } else {
          pdfDoc.setTextColor(...secondaryColor);
          pdfDoc.text(week.name, 15, currentWeekY);
        }

        // Add week summary using the pre-calculated totals
        pdfDoc.setFont("helvetica", "normal");
        pdfDoc.setFontSize(10);
        pdfDoc.text(`Total Sales: PHP ${week.sales.toLocaleString()}`, 30, currentWeekY + 8);
        pdfDoc.text(`Total Orders: ${week.orders}`, 120, currentWeekY + 8);

        // Prepare data for the table
        const tableData = [];

        // Process each day in this week
        for (const day of week.days) {
          // Format date
          const formattedDate = day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const formattedDay = day.dayOfWeek;

          // Log the day data for debugging
          console.log(`Processing day for table: ${formattedDate}, orders=${day.orders}, sales=${day.sales}`);

          // For future dates, show "Upcoming" instead of zeros
          if (day.date > today) {
            tableData.push([
              formattedDate,
              formattedDay,
              "—",
              "Upcoming",
              "—"
            ]);
            continue;
          }

          // Calculate average order value for this specific day
          const avgOrder = day.orders > 0 ? day.sales / day.orders : 0;

          // Add the day's data to the table
          tableData.push([
            formattedDate,
            formattedDay,
            day.orders || '0',
            `PHP ${day.sales?.toLocaleString() || '0'}`,
            day.orders > 0 ? `PHP ${avgOrder.toLocaleString(undefined, {maximumFractionDigits: 2})}` : '—'
          ]);
        }

        // Log the table data for debugging
        console.log(`Week ${weekIndex + 1} table data:`, tableData);

        // Add week table with optimized settings
        autoTable(pdfDoc, {
          startY: currentWeekY + 12,
          head: [['Date', 'Day', 'Orders', 'Revenue', 'Avg. Order']],
          body: tableData,
          styles: {
            fontSize: 9,
            cellPadding: 4,
            lineWidth: 0.1,
            lineColor: [220, 220, 220],
            font: "helvetica"
          },
          headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'center',
          },
          columnStyles: {
            0: { halign: 'center', cellWidth: 25 },
            1: { halign: 'left', cellWidth: 40 },
            2: { halign: 'center', cellWidth: 25 },
            3: { halign: 'right', cellWidth: 30 },
            4: { halign: 'right', cellWidth: 30 }
          },
          alternateRowStyles: {
            fillColor: [252, 252, 252]
          },
          // Optimized cell styling
          didParseCell: function(data) {
            // Only process cells that need styling (more efficient)
            if (data.cell.text && data.cell.text[0] === "Upcoming") {
              data.cell.styles.textColor = [150, 150, 150]; // Gray text
              data.cell.styles.fontStyle = 'italic';
            }
          },
          // Add page footer on each new page
          didDrawPage: () => {
            addPageHeader(pdfDoc, primaryColor);
            addPageFooter();
          },
          // Disable unnecessary hooks for better performance
          willDrawCell: undefined,
          didDrawCell: undefined,
        });

        // Update Y position for next week
        currentWeekY = pdfDoc.lastAutoTable.finalY + 15;
      });

      // Add recommendations section
      const recommendationsY = currentWeekY;

      // Check if we need a new page
      if (recommendationsY > 240) {
        pdfDoc.addPage();
        addPageHeader(pdfDoc, primaryColor);
      }

      // Add recommendations title
      pdfDoc.setFont("helvetica", "bold");
      pdfDoc.setFontSize(12);
      pdfDoc.setTextColor(...secondaryColor);
      pdfDoc.text("RECOMMENDATIONS", 15, recommendationsY > 240 ? 40 : recommendationsY);

      // Create recommendations box
      const recBoxY = recommendationsY > 240 ? 45 : recommendationsY + 5;
      pdfDoc.setDrawColor(...primaryColor);
      pdfDoc.setFillColor(...lightBgColor);
      pdfDoc.roundedRect(15, recBoxY - 5, 180, 50, 3, 3, 'FD');

      // Add recommendations
      pdfDoc.setFont("helvetica", "normal");
      pdfDoc.setFontSize(10);
      pdfDoc.setTextColor(...textColor);

      const recommendations = [
        `• Consider running promotions during ${worstWeek.name} to boost sales during the slowest week.`,
        `• Capitalize on ${bestWeek.name}'s success by featuring special items or bundles.`,
        `• Focus on increasing average order value through upselling and cross-selling.`,
        `• Analyze weekly patterns to optimize inventory and staffing throughout the month.`,
        `• Consider loyalty programs to encourage repeat customers and higher spending.`
      ];

      recommendations.forEach((rec, index) => {
        pdfDoc.text(rec, 20, recBoxY + (index * 8));
      });

      // Save the PDF with highly optimized settings
      const fileName = `${monthYear.replace(' ', '')}_MonthlyReport_${today.getFullYear()}.pdf`;

      // Use a more efficient approach with blob for faster PDF generation
      const pdfBlob = pdfDoc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Create a hidden link and trigger download programmatically
      const downloadLink = document.createElement('a');
      downloadLink.href = pdfUrl;
      downloadLink.download = fileName;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);

      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        downloadLink.click();
        // Clean up
        setTimeout(() => {
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(pdfUrl);
          const endTime = performance.now();
          console.log(`PDF generated and saved in ${(endTime - startTime).toFixed(2)}ms`);
        }, 100);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Error generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Optimized handleDownload function for faster performance
  const handleDownload = async (history) => {
    try {
      console.log("Starting download process for history:", history.id);
      const startTime = performance.now();

      setLoading(true);
      setError(null);

      // Check if we already have the data in the history object
      if (history.totalRevenue !== undefined && history.dailySales) {
        console.log("Using cached data from history object");
        // Use the data directly from the history object
        const weekData = {
          totalRevenue: history.totalRevenue,
          totalOrders: history.totalOrders,
          dailySales: history.dailySales
        };

        // Generate PDF with the cached data
        await generatePDF(history.monthYear, weekData);

        const endTime = performance.now();
        console.log(`Download completed in ${(endTime - startTime).toFixed(2)}ms using cached data`);
        return;
      }

      // If we don't have cached data, fetch it from Firestore
      console.log("No cached data found, fetching from Firestore");

      // Get the dates for the entire month from the history date
      const historyDate = new Date(history.dateSaved);
      const firstDayOfMonth = new Date(historyDate.getFullYear(), historyDate.getMonth(), 1);
      const lastDayOfMonth = new Date(historyDate.getFullYear(), historyDate.getMonth() + 1, 0);

      // Set the start and end dates for the query to cover the entire month
      const startDate = new Date(firstDayOfMonth);
      const endDate = new Date(lastDayOfMonth);

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      console.log("Fetching orders from:", startDate.toISOString(), "to", endDate.toISOString());

      // Improved query to fetch all delivered orders
      const ordersQuery = query(
        collection(db, "order_transaction"),
        where("order_status", "==", "Delivered")
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      console.log(`Fetched ${ordersSnapshot.size} total orders in handleDownload`);

      // Initialize tracking objects
      const dailySales = {};
      let totalRevenue = 0;
      let totalOrders = 0;

      // Initialize dailySales for each day of the month
      const daysInMonth = lastDayOfMonth.getDate();
      const monthDates = [];

      // Generate all dates in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), day);
        monthDates.push(date);
      }

      // Create dateKeys from the month dates with timezone adjustment
      const dateKeys = monthDates.map(date => {
        // Fix timezone issue by using local date formatting instead of UTC
        const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
        return localDate.toISOString().split('T')[0];
      });

      console.log("Initialized date keys for handleDownload:", dateKeys);

      dateKeys.forEach(dateKey => {
        dailySales[dateKey] = { orders: 0, sales: 0 };
      });

      // Process each order with detailed logging
      let ordersInRange = 0;
      ordersSnapshot.forEach(docSnapshot => {
        const orderData = docSnapshot.data();
        const orderId = docSnapshot.id;

        // Skip if no order_date
        if (!orderData.order_date) return;

        // Convert Firestore timestamp to Date
        const orderDate = orderData.order_date.toDate ? orderData.order_date.toDate() : new Date(orderData.order_date);

        // Check if the order is within our date range
        if (orderDate < startDate || orderDate > endDate) return;

        ordersInRange++;

        // Fix timezone issue by using local date formatting instead of UTC
        const localDate = new Date(orderDate.getTime() - (orderDate.getTimezoneOffset() * 60000));
        const dateKey = localDate.toISOString().split('T')[0];

        console.log(`Order ${docSnapshot.id} date: ${orderDate.toLocaleString()}, dateKey: ${dateKey}`);

        const orderTotal = parseFloat(orderData.order_total || 0);

        if (dailySales[dateKey]) {
          // Store the previous values for logging
          const prevOrders = dailySales[dateKey].orders;
          const prevSales = dailySales[dateKey].sales;

          // Update the values
          dailySales[dateKey].orders++;
          dailySales[dateKey].sales += orderTotal;
          totalRevenue += orderTotal;
          totalOrders++;

          console.log(`Added order ${orderId} to daily sales: ${dateKey}`);
          console.log(`  - Before: Orders=${prevOrders}, Sales=${prevSales}`);
          console.log(`  - After: Orders=${dailySales[dateKey].orders}, Sales=${dailySales[dateKey].sales}`);
          console.log(`  - Order total: ${orderTotal}`);
        }
      });

      console.log(`Orders within date range: ${ordersInRange} out of ${ordersSnapshot.size} total orders`);
      console.log(`Total calculated: Revenue=${totalRevenue}, Orders=${totalOrders}`);

      const weekData = {
        totalRevenue,
        totalOrders,
        dailySales
      };

      // Generate PDF with the fetched data
      await generatePDF(history.monthYear, weekData);

      const endTime = performance.now();
      console.log(`Download completed in ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error("Error generating report:", error);
      setError(`Error generating report: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function removed to optimize code

  // Improved fetchWeeklyData function for accurate data retrieval
const fetchWeeklyData = async () => {
  try {
    console.log("Starting fetchWeeklyData...");
    const startTime = performance.now();

    // Get the current date
    const today = new Date();

    // Get the dates for the entire current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Set the start and end dates for the query to cover the entire month
    const startDate = new Date(firstDayOfMonth);
    const endDate = new Date(lastDayOfMonth);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    console.log("Fetching orders from:", startDate.toISOString(), "to", endDate.toISOString());

    // Check if we have cached data for this date range
    const cacheKey = `orders_${startDate.toISOString()}_${endDate.toISOString()}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
      console.log("Using cached order data for faster processing");
      const parsedData = JSON.parse(cachedData);
      return parsedData;
    }

    // Optimized query with date filtering and error handling
    console.log("Fetching delivered orders within date range for faster processing");

    // Create the query
    const ordersQuery = query(
      collection(db, "order_transaction"),
      where("order_status", "==", "Delivered"),
      // Add date range filtering to reduce the amount of data fetched
      where("order_date", ">=", startDate),
      where("order_date", "<=", endDate)
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    console.log(`Fetched ${ordersSnapshot.size} total orders in fetchWeeklyData`);

    // Initialize tracking objects
    const dailySales = {};
    let totalRevenue = 0;
    let totalOrders = 0;

    // Initialize dailySales for each day of the month
    const daysInMonth = lastDayOfMonth.getDate();
    const monthDates = [];

    // Generate all dates in the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth(), day);
      monthDates.push(date);
    }

    // Create dateKeys from the month dates with timezone adjustment
    const dateKeys = monthDates.map(date => {
      // Fix timezone issue by using local date formatting instead of UTC
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      return localDate.toISOString().split('T')[0];
    });

    console.log("Initialized date keys:", dateKeys);

    dateKeys.forEach(dateKey => {
      dailySales[dateKey] = { orders: 0, sales: 0 };
    });

    // Process orders in batch for better performance
    console.log("Processing orders with optimized batch processing...");
    const startProcessingTime = performance.now();

    // Use a more efficient approach with less logging for better performance
    const validOrders = ordersSnapshot.docs
      .map(doc => {
        const data = doc.data();
        if (!data.order_date) return null;

        const orderDate = data.order_date.toDate ? data.order_date.toDate() : new Date(data.order_date);
        // We already filtered by date in the query, but double-check just in case
        if (orderDate < startDate || orderDate > endDate) return null;

        // Fix timezone issue by using local date formatting instead of UTC
        const localDate = new Date(orderDate.getTime() - (orderDate.getTimezoneOffset() * 60000));
        const dateKey = localDate.toISOString().split('T')[0];

        console.log(`Order ${doc.id} date: ${orderDate.toLocaleString()}, dateKey: ${dateKey}`);

        return {
          id: doc.id,
          date: orderDate,
          dateKey: dateKey,
          total: parseFloat(data.order_total || 0)
        };
      })
      .filter(order => order !== null);

    console.log(`Found ${validOrders.length} valid orders to process`);

    // Process all orders in a single batch
    validOrders.forEach(order => {
      if (dailySales[order.dateKey]) {
        dailySales[order.dateKey].orders++;
        dailySales[order.dateKey].sales += order.total;
        totalRevenue += order.total;
        totalOrders++;
      }
    });

    const endProcessingTime = performance.now();
    console.log(`Order processing completed in ${(endProcessingTime - startProcessingTime).toFixed(2)}ms`);

    // Cache the results for future use
    const result = {
      dailySales,
      totalRevenue,
      totalOrders
    };

    // Store in session storage for faster access next time
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
      console.log("Cached order data for future use");
    } catch (cacheError) {
      console.warn("Could not cache order data:", cacheError);
    }

    console.log(`Orders within date range: ${validOrders.length} out of ${ordersSnapshot.size} total orders`);
    console.log(`Total calculated: Revenue=${totalRevenue}, Orders=${totalOrders}`);

    // Log daily sales for debugging
    console.log("=== DETAILED DAILY SALES SUMMARY ===");
    let daysWithSales = 0;
    Object.entries(dailySales).forEach(([date, data]) => {
      if (data.orders > 0) {
        daysWithSales++;
        console.log(`${date}: ${data.orders} orders, PHP ${data.sales} sales`);
      }
    });
    console.log(`Total days with sales: ${daysWithSales}`);
    console.log(`Total revenue: PHP ${totalRevenue}`);
    console.log(`Total orders: ${totalOrders}`);
    console.log("=== END OF DAILY SALES SUMMARY ===");

    // Calculate total execution time
    const endTime = performance.now();
    console.log(`fetchWeeklyData completed in ${(endTime - startTime).toFixed(2)}ms`);

    // Return the result (already defined above)
    return result;
  } catch (error) {
    console.error('Error fetching weekly data:', error);
    setError(`Failed to fetch analytics data: ${error.message}`);
    return { dailySales: {}, totalRevenue: 0, totalOrders: 0 };
  }
};

// Define the checkAndUpdateWeeklyReport function outside of useEffect
const checkAndUpdateWeeklyReport = async () => {
  try {
    // Get the current date
    const today = new Date();
    console.log("Current date:", today.toLocaleDateString());

    const weekNumber = getWeekNumber(today);
    const monthYear = today.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    console.log("Current month/year:", monthYear);
    console.log("Current week number:", weekNumber);

    // Query for existing report for current week
    const weeklyReportQuery = query(
      collection(db, "analyticReportSaved"),
      where("weekNumber", "==", weekNumber),
      where("monthYear", "==", monthYear),
      limit(1)
    );

    const snapshot = await getDocs(weeklyReportQuery);
    console.log("Found existing reports:", snapshot.size);

    // Fetch the weekly data
    const weekData = await fetchWeeklyData();
    console.log("Fetched week data:", weekData);

    if (!snapshot.empty) {
      // Update existing report
      const docRef = doc(db, "analyticReportSaved", snapshot.docs[0].id);
      console.log("Updating existing report:", snapshot.docs[0].id);

      await updateDoc(docRef, {
        ...weekData,
        lastUpdated: serverTimestamp()
      });

      console.log("Report updated successfully");
    } else {
      // Create new report
      console.log("Creating new report for:", monthYear, "Week:", weekNumber);

      const newDocRef = await addDoc(collection(db, "analyticReportSaved"), {
        monthYear,
        weekNumber,
        dateSaved: serverTimestamp(),
        ...weekData
      });

      console.log("New report created with ID:", newDocRef.id);
    }

    // Refresh the list of saved histories
    await fetchSavedHistories();
  } catch (error) {
    console.error("Error checking/updating weekly report:", error);
    setError(`Failed to update analytics report: ${error.message}`);
  } finally {
    // Ensure loading is set to false even if there's an error
    setLoading(false);
  }
};

// Optimized initializeData function for faster performance
const initializeData = async () => {
  try {
    // Start with just fetching the histories (faster)
    const histories = await fetchSavedHistories();

    // Use the returned histories directly instead of accessing state
    // This avoids race conditions and is more efficient
    const needsUpdate = histories.length === 0 ||
      (histories[0]?.dateSaved &&
       new Date(histories[0].dateSaved).getTime() < Date.now() - 86400000);

    if (needsUpdate) {
      console.log("Weekly report needs update, running checkAndUpdateWeeklyReport");
      // Use setTimeout to prevent UI blocking and allow the histories to render first
      setTimeout(async () => {
        try {
          await checkAndUpdateWeeklyReport();
        } catch (updateErr) {
          console.error("Error updating weekly report:", updateErr);
          setError(`Failed to update weekly report: ${updateErr.message}`);
        } finally {
          setLoading(false);
        }
      }, 100);
    } else {
      console.log("Weekly report is up to date, skipping update");
      setLoading(false);
    }
  } catch (err) {
    console.error("Error in analytics initialization:", err);
    setError(`Failed to initialize analytics: ${err.message}`);
    setLoading(false);
  }
};

// Use a single useEffect to initialize data
useEffect(() => {
  // Call initializeData when component mounts
  initializeData();

  // Cleanup function to ensure loading state is reset if component unmounts
  return () => {
    setLoading(false);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  return (
    <div className="w-full overflow-auto h-9/12 bg-gray-50/50 py-6">
      <section className="w-[94.5%] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Monthly Analytics Reports</h1>
          <p className="text-gray-500 mt-1">View and download comprehensive monthly analytics with weekly breakdowns</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Report Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Generated Date</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {savedHistories.map((history, index) => (
                  <tr key={index} className="group hover:bg-amber-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{`${history.monthYear}_MonthlyReport.pdf`}</p>
                          <p className="text-xs text-gray-500">Analytics Report</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{history.dateSaved}</p>
                        <p className="text-xs text-gray-500">Last generated</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDownload(history)}
                        className="inline-flex items-center justify-center p-2 text-amber-600 hover:text-amber-700
                                 hover:bg-amber-50 rounded-lg transition-colors group-hover:bg-amber-100/50"
                        title="Download Report"
                      >
                        <LuDownload className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {savedHistories.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500">No analytics reports available</p>
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null);
                fetchSavedHistories();
              }}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-amber-500/30 border-t-amber-500" />
              <p className="text-sm font-medium text-gray-900">Generating monthly analytics report...</p>
              <button
                onClick={() => setLoading(false)}
                className="mt-2 text-xs text-amber-600 hover:text-amber-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AnalyticsSaveHistory;
