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
  "https://serverless-api-hatid-5.onrender.com/.netlify/functions/api/subs/subscription-revenue";

const TabBar = React.lazy(() => import("../tab-bar/tabBar"));

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [commutersCount, setCommutersCount] = useState(0);
  const [driversCount, setDriversCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [ratingsData, setRatingsData] = useState([]);
  const [topPerformingDrivers, setTopPerformingDrivers] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [fromDate, setFromDate] = useState(""); 
  const [toDate, setToDate] = useState(""); 
  const [timeFrame, setTimeFrame] = useState("daily"); 

  
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

     
      const driverRatings = ratingsResponse.data.reduce((acc, rating) => {
        const driverId = rating.driver?._id || "Unknown Driver";
        const driverName = rating.driver?.name || "Unknown Driver"; 
        const driverPic = rating.driver?.profilePic || "./defaultPic.jpg"; 

        if (!acc[driverId]) {
          acc[driverId] = { name: driverName, profilePic: driverPic, totalRating: 0, count: 0 };
        }

        acc[driverId].totalRating += rating.rating; 
        acc[driverId].count += 1;
        return acc;
      }, {});

      
      const sortedDrivers = Object.values(driverRatings)
        .map((driver) => ({
          name: driver.name,
          profilePic: driver.profilePic,
          averageRating: (driver.totalRating / driver.count).toFixed(2), 
          totalRating: driver.totalRating,
        }))
        .sort((a, b) => b.totalRating - a.totalRating);

      setTopPerformingDrivers(sortedDrivers.slice(0, 5)); 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get(SUBSCRIPTION_API_URL);
        const subscriptionData = response.data;

        setSubscriptions(subscriptionData);

        const total = subscriptionData.reduce((sum, subscription) => {
          return sum + (subscription.price || 0); 
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
        icon: <BsPeopleFill className="card_icon" />,
      },
      {
        label: "BOOKINGS",
        count: bookingCount,
        icon: <img src="./tricy.png" alt="Tricy Image" className="tricy_icon" />,
      },      
      {
        label: "TOTAL REVENUE",
        count: `₱ ${totalRevenue.toLocaleString()}`,
        icon: <span style={{ fontSize: "24px", color: "black" }}>₱</span>,
      }
      
      
    ],
    [commutersCount, driversCount, bookingCount, totalRevenue]
  );

  const getFormattedDate = (date) => {
    return date.toISOString().split("T")[0]; 
  };

  const getWeekNumber = (date) => {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + 1) / 7);
  };

  const getMonthString = (date) => {
    const months = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
    ];
    return months[date.getMonth()];
  };

  const getYearString = (date) => {
    return date.getFullYear();
  };

  useEffect(() => {
    const fetchChartData = () => {
      const filteredSubscriptions = subscriptions.filter((sub) => {
        const subDate = new Date(sub.startDate);
        const from = new Date(fromDate || "2000-01-01");
        const to = new Date(toDate || "2100-01-01");
        return subDate >= from && subDate <= to;
      });

      const revenueData = {};

      filteredSubscriptions.forEach((sub) => {
        const date = new Date(sub.startDate);
        let key;

        switch (timeFrame) {
          case "weekly":
            key = `${date.getFullYear()}-W${getWeekNumber(date)}`;
            break;
          case "monthly":
            key = `${getMonthString(date)} ${getYearString(date)}`;
            break;
          case "annually":
            key = `${getYearString(date)}`;
            break;
          default:
            key = getFormattedDate(date);
        }

        if (sub.price) {
          revenueData[key] = (revenueData[key] || 0) + sub.price;
        }
      });

      const labels = Object.keys(revenueData); 
      const data = labels.map((label) => revenueData[label]);

      setChartData({
        labels,
        datasets: [
          {
            label: `Revenue (${timeFrame})`,
            data,
            borderColor: "green",
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            borderWidth: 2,
            fill: false,
          },
        ],
      });
    };

    fetchChartData();
  }, [subscriptions, fromDate, toDate, timeFrame]);

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
          <h2>Revenue ({timeFrame})</h2>
          <select onChange={(e) => setTimeFrame(e.target.value)} value={timeFrame}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.dataset.label}: ₱${context.raw.toLocaleString()}`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `₱${value.toLocaleString()}`,
                  },
                  title: {
                    display: true,
                    text: "Revenue (₱)",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Time",
                  },
                  type: "category",
                },
              },
            }}
          />
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
          ) : (
            <p>No Top Performing Drivers</p>
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
