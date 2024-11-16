import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/dashboard/dashboard';
import Applications from './components/applications/applications';
import Driver from './components/drivers/driver';
import Commuters from './components/commuters/commuters';
import Blocklist from './components/blocklist/blocklist';
import Subscription from './components/subscription/subscription';
import Violations from './components/violations/violations';
import Signup from './components/signup/signup';




const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/driver" element={<Driver/>} />
        <Route path="/commuters" element={<Commuters />} />
        <Route path="/blocklist" element={<Blocklist  />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/violations" element={<Violations />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
};

export default App;
