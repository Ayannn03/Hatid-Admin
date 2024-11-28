import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import axios from "axios";
import { BsPeopleFill, BsCarFrontFill, BsCurrencyDollar } from "react-icons/bs";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "./dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const COMMUTERS_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/users";
const DRIVERS_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/driver";
const BOOKING_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/ride/booking";
const RATINGS_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/rate/ratings";
const SUBSCRIPTION_API_URL =
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription";

const TabBar = React.lazy(() => import("../tab-bar/tabBar"));

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [commutersCount, setCommutersCount] = useState(0);
  const [driversCount, setDriversCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [ratingsData, setRatingsData] = useState([]);
  const [topPerformingDrivers, setTopPerformingDrivers] = useState([]);
  const [chartTimeRange, setChartTimeRange] = useState("monthly"); // State for time range

  // Fetch data from APIs
  const fetchData = useCallback(async () => {
    try {
      const [commutersResponse, driversResponse, bookingsResponse, ratingsResponse] =
        await Promise.all([
          axios.get(COMMUTERS_API_URL),
          axios.get(DRIVERS_API_URL),
          axios.get(BOOKING_API_URL),
          axios.get(RATINGS_API_URL),
        ]);

      setCommutersCount(commutersResponse.data.length);
      setDriversCount(driversResponse.data.length);
      setBookingCount(bookingsResponse.data.length);
      setRatingsData(ratingsResponse.data);

      // Process top-performing drivers from ratings data
      const driverRatings = ratingsResponse.data.reduce((acc, rating) => {
        const driverId = rating.driver?._id || "Unknown Driver"; // Use `driver._id` for unique identification
        const driverName = rating.driver?.name || "Unknown Driver"; // Use `driver.name` for display
        const driverPic = rating.driver?.profilePic || "./defaultPic.jpg"; // Get profile picture

        if (!acc[driverId]) {
          acc[driverId] = { name: driverName, profilePic: driverPic, totalRating: 0, count: 0 };
        }

        acc[driverId].totalRating += rating.rating; // Add rating score
        acc[driverId].count += 1; // Increment count

        return acc;
      }, {});

      // Convert to an array and sort by totalRating
      const sortedDrivers = Object.values(driverRatings)
        .map((driver) => ({
          name: driver.name,
          profilePic: driver.profilePic,
          averageRating: (driver.totalRating / driver.count).toFixed(2), // Calculate average rating
          totalRating: driver.totalRating,
        }))
        .sort((a, b) => b.totalRating - a.totalRating);

      setTopPerformingDrivers(sortedDrivers.slice(0, 5)); // Top 5 drivers
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate total revenue from subscriptions
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get(SUBSCRIPTION_API_URL);
        const subscriptionData = response.data;

        setSubscriptions(subscriptionData);

        const total = subscriptionData.reduce((sum, subscription) => {
          return sum + (subscription.price || 0); // Default to 0 if price is undefined
        }, 0);

        setTotalRevenue(total);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    fetchSubscriptions();
  }, []);

  const cardData = useMemo(
    () => [
      {
        label: "COMMUTERS",
        count: commutersCount,
        icon: <BsPeopleFill className="card_icon" />,
      },
      {
        label: "DRIVERS",
        count: driversCount,
        icon: <BsCarFrontFill className="card_icon" />,
      },
      {
        label: "BOOKINGS",
        count: bookingCount,
        icon: <BsCarFrontFill className="card_icon" />,
      },
      {
        label: "TOTAL REVENUE",
        count: `$${totalRevenue.toLocaleString()}`,
        icon: <BsCurrencyDollar className="card_icon" />,
      },
    ],
    [commutersCount, driversCount, bookingCount, totalRevenue]
  );

  // Chart.js Data for Revenue based on Time Range
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Revenue",
        data: [],
        fill: false,
        backgroundColor: "rgba(75,192,192,1)",
        borderColor: "rgba(75,192,192,1)",
      },
    ],
  });

  // Helper function to get week number
  const getWeekNumber = (date) => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + 1) / 7);
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(SUBSCRIPTION_API_URL);
        const subscriptions = response.data;

        // Filter subscriptions based on the selected time range
        const filteredRevenue = {};

        subscriptions.forEach((sub) => {
          const startDate = new Date(sub.startDate);
          let periodKey;

          // Determine the time period (monthly, weekly, annually)
          if (chartTimeRange === "monthly") {
            periodKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`;
          } else if (chartTimeRange === "weekly") {
            const week = getWeekNumber(startDate); // Calculate ISO week number
            periodKey = `${startDate.getFullYear()}-W${week}`;
          } else if (chartTimeRange === "annually") {
            periodKey = `${startDate.getFullYear()}`;
          }

          if (sub.subscriptionType === "Monthly" && sub.price) {
            filteredRevenue[periodKey] = (filteredRevenue[periodKey] || 0) + sub.price;
          }
        });

        const sortedPeriods = Object.keys(filteredRevenue).sort();
        const revenueData = sortedPeriods.map((period) => filteredRevenue[period]);

        setChartData({
          labels: sortedPeriods,
          datasets: [
            {
              ...chartData.datasets[0],
              data: revenueData,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, [chartTimeRange]);

  return (
    <main className="main-container">
      <div className="main-title">
        <h3>DASHBOARD</h3>
      </div>

      <div className="main-cards">
        {cardData.map((card, index) => (
          <div className="card" key={index}>
            <div className="card-inner">
              <h3>{card.label}</h3>
              {card.icon}
            </div>
            <h1>{card.count}</h1>
          </div>
        ))}
      </div>
      <div className="chart-and-ratings">
      <div className="chart">
        <h2>Revenue by {chartTimeRange.charAt(0).toUpperCase() + chartTimeRange.slice(1)}</h2>

        <div className="time-range-selector">
          <select
            value={chartTimeRange}
            onChange={(e) => setChartTimeRange(e.target.value)}
            className="time-range-dropdown"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
        </div>

        <Line data={chartData} />
      </div>

      <div className="ratings-container">
        {topPerformingDrivers.length > 0 ? (
          <div className="top-driver-card">
            <h3>Top Driver</h3>
            <div className="top-driver-content">
              <img
                src={topPerformingDrivers[0].profilePic || "./defaultPic.jpg"}
                alt="Profile"
                className="profile-pic"
              />
              <h4>{topPerformingDrivers[0].name}</h4>
              <p>Average Rating: {topPerformingDrivers[0].averageRating}</p>
              <p>Total Points: {topPerformingDrivers[0].totalRating}</p>
            </div>
          </div>
        ):(
          <p> No Top Performing Drivers</p>
        )}
        <div className="ratings-card">
        <h3>Top Performing Drivers</h3>
        {topPerformingDrivers.length > 0 ? (
          <ul>
            {topPerformingDrivers.map((driver, index) => (
              <li key={index}>
                <strong>{driver.name || "N/A"}</strong>
                <span>
                  {driver.averageRating} (Total: {driver.totalRating} points)
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No Top Performing Drivers</p>
        )}
      </div>
      </div>
    </div>


      <Suspense fallback={<div>Loading...</div>}>
        <TabBar />
      </Suspense>
    </main>
  );
}

export default Dashboard;
