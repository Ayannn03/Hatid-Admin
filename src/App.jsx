import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/dashboard/dashboard';
import Driver from './components/drivers/driver';
import Employee from './components/employee/employee';
import Commuters from './components/commuters/commuters';
import Blocklist from './components/blocklist/blocklist';
import Subscription from './components/subscription/subscription';
const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/driver" element={<Driver />} />
        <Route path="/employees" element={<Employee />} />
        <Route path="/commuters" element={<Commuters />} />
        <Route path="/blocklist" element={<Blocklist />} />
        <Route path="/subscription" element={<Subscription />} />
      </Routes>
    </Router>
  );
};

export default App;
