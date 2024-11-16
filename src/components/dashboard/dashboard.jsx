import React, {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
  useMemo,
} from "react";
import axios from "axios";
import { BsPeopleFill, BsCarFrontFill, BsCurrencyDollar } from "react-icons/bs";
import { BarChart } from '@mui/x-charts/BarChart';
import "./dashboard.css";

const COMMUTERS_API_URL =
  "https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/users";
const DRIVERS_API_URL =
  "https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/driver";
const BOOKING_API_URL =
  "https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/ride/booking";
const SUBSCRIPTION_API_URL =
  "https://melodious-conkies-9be892.netlify.app/.netlify/functions/api/subs/subscription";

const TabBar = lazy(() => import("../tab-bar/tabBar"));

function Dashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [commutersCount, setCommutersCount] = useState(0);
  const [driversCount, setDriversCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [calendar, setCalendar] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const [datesHtml, setDatesHtml] = useState("");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get(SUBSCRIPTION_API_URL);
        const subscriptionData = response.data;

        setSubscriptions(subscriptionData);

        // Calculate the total revenue from all subscriptions
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

  const fetchData = useCallback(async () => {
    try {
      const [commutersResponse, driversResponse, bookingsResponse] =
        await Promise.all([
          axios.get(COMMUTERS_API_URL),
          axios.get(DRIVERS_API_URL),
          axios.get(BOOKING_API_URL),
        ]);

      setCommutersCount(commutersResponse.data.length);
      setDriversCount(driversResponse.data.length);
      setBookingCount(bookingsResponse.data.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        count: totalRevenue,
        icon: <BsCurrencyDollar className="card_icon" />,
      },
    ],
    [commutersCount, driversCount, bookingCount, totalRevenue]
  );

  const booking =[BOOKING_API_URL]
  const revenue = [SUBSCRIPTION_API_URL]
  

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const renderCalendar = useCallback(() => {
    const { month, year } = calendar;
    const start = new Date(year, month, 1).getDay();
    const endDate = new Date(year, month + 1, 0).getDate();
    const end = new Date(year, month, endDate).getDay();
    const endDatePrev = new Date(year, month, 0).getDate();

    let datesHtml = "";

    for (let i = start; i > 0; i--) {
      datesHtml += `<li class="inactive">${endDatePrev - i + 1}</li>`;
    }

    for (let i = 1; i <= endDate; i++) {
      const isToday =
        i === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();
      datesHtml += `<li${isToday ? ' class="today"' : ""}>${i}</li>`;
    }

    for (let i = end; i < 6; i++) {
      datesHtml += `<li class="inactive">${i - end + 1}</li>`;
    }

    setDatesHtml(datesHtml);
  }, [calendar]);

  useEffect(() => {
    renderCalendar();
  }, [renderCalendar]);

  const handleNavClick = (direction) => {
    setCalendar((prevCalendar) => {
      let newMonth = prevCalendar.month + (direction === "next" ? 1 : -1);
      let newYear = prevCalendar.year;

      if (newMonth === 12) {
        newMonth = 0;
        newYear += 1;
      } else if (newMonth === -1) {
        newMonth = 11;
        newYear -= 1;
      }

      return { month: newMonth, year: newYear };
    });
  };

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
      <BarChart
      series={[
        { data: [35, 44, 24, 34] },
        { data: [51, 6, 49, 30] },
        { data: [15, 25, 30, 50] },
        { data: [60, 50, 15, 25] },
      ]}
      height={450}
      width={800}
      xAxis={[{ data: ['Q1', 'Q2', 'Q3', 'Q4'], scaleType: 'band' }]}
      margin={{ top: 80, bottom: 30, left: 80, right: 10 }}
    />
      <div className="calendar">
        <div className="calendar-header">
        <button id="prev" onClick={() => handleNavClick("prev")}></button>
        <button id="next" onClick={() => handleNavClick("next")}></button>
          <h3>{`${months[calendar.month]} ${calendar.year}`}</h3>
        </div>
        <ul className="dates" dangerouslySetInnerHTML={{ __html: datesHtml }} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <TabBar />
      </Suspense>
    </main>
  );
}

export default Dashboard;
