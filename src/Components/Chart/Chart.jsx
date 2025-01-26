import React, { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import Papa from "papaparse";

const Chart = () => {
  const chartContainerRef = useRef(null);
  const [chartData, setChartData] = useState({ areaData: [], candlestickData: [] });

  useEffect(() => {
    // Function to load and parse CSV data
    const loadData = () => {
      Papa.parse("./EURUSD_H1.csv", {
        download: true, // Download the CSV file from the given URL
        header: true, // Assume the first row contains column headers
        dynamicTyping: true, // Auto-convert data types like numbers
        complete: (result) => {

          // Ensure data exists and is properly formatted
          if (result.data && result.data.length > 0) {
            const candlestickData = result.data
            .filter((item) => item["<DATE>"] && item["<TIME>"]) // Filter valid rows
            .map((item) => {
              const dateTime = `${item["<DATE>"].replace(/\./g, "-")}T${item["<TIME>"]}`;
              const unixTimestamp = Math.floor(new Date(dateTime).getTime() / 1000); // Convert to Unix timestamp
              return {
                time: unixTimestamp, // Use Unix timestamp
                open: item["<OPEN>"],
                high: item["<HIGH>"],
                low: item["<LOW>"],
                close: item["<CLOSE>"],
              };
            });

            // Set the chart data state
            setChartData({candlestickData });
          } else {
            console.error("No data found in the CSV file.");
          }
        },
        error: (err) => {
          console.error("Error loading the CSV file:", err);
        },
      });
    };

    // Load the data when the component mounts
    loadData();
  }, []);

  useEffect(() => {

    if (chartData.candlestickData.length === 0) return;

    const chartOptions = {
      layout: {
        textColor: "#d4d4d4", // Light text color
        background: { type: "solid", color: "#1e1e1e" }, // Dark background color
      },
      timeScale: {
        timeVisible: true, // Show hours and minutes
        secondsVisible: false, // Optionally enable seconds
      },
      priceScale: {
        normal: true,
      },
      grid: {
        vertLines: {
          color: "#3c3c3c", // Subtle vertical grid line color
          style: 1, // Solid line
          visible: true,
          width: 1,
        },
        horzLines: {
          color: "#3c3c3c", // Subtle horizontal grid line color
          style: 1, // Solid line
          visible: true,
          width: 1,
        },
      },
    };
    
  

    const chart = createChart(chartContainerRef.current, chartOptions);

    // Add candlestick series to the chart
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    // Create chart only when data is available
    candlestickSeries.setData(chartData.candlestickData);


    // Fit content to the chart
    chart.timeScale()

    return () => {
      chart.remove(); // Clean up the chart when the component unmounts
    };
  }, [chartData]);

  return <div ref={chartContainerRef} style={{ height: "900px", width: "100%" }}></div>;
};

export default Chart;
