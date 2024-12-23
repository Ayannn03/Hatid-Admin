import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/dashboard/dashboard';
import Applications from './components/applications/applications';
import Driver from './components/drivers/driver';
import Commuters from './components/commuters/commuters';
import Blocklist from './components/blocklist/blocklist';
import Subscription from './components/subscription/subscription';
import Jeep from './components/subscription/Jeep';
import Violations from './components/violations/violations';
import Signup from './components/signup/signup';
import Report from './components/report/driverReport'
import Fare from './components/settings/fareSettings'
import Requirements from './components/settings/requirementsSettings';
import CommutersList from './components/report/commutersList'
import ViolationReport from './components/report/violationsReport'
import TopPerforming from './components/report/topPerforming'
import Booking from './components/report/bookingReport'
import ExpiredSubs from './components/subscription/expiredSubs'
import SubscriptionRequest from './components/subscription/subscriptionReq'
import Expired from './components/report/expired'
import Active from './components/report/subsActive'
import Cancel from './components/report/cancel'
import Rate from './components/settings/ratingSettings'
import Contact from './components/settings/contact'
import Suspended from './components/drivers/suspended'
import Payment from './components/payment/payment';




const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/dash" element={<Dashboard />} />
        <Route path="/driver" element={<Driver/>} />
        <Route path="/commuters" element={<Commuters />} />
        <Route path="/blocklist" element={<Blocklist  />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/jeepney" element={<Jeep />} />
        <Route path="/violations" element={<Violations />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/driverReport" element= {<Report />}/>
        <Route path="/fare" element= {<Fare />}/>
        <Route path="/requirements" element= {<Requirements/>}/>
        <Route path="/payment" element = {< Payment/>}/>
        <Route path='/commutersReport' element = {<CommutersList/>}/>
        <Route path='/violationsReport' element = {<ViolationReport/>}/>
        <Route path='/topPerforming' element = {<TopPerforming/>}/>
         <Route path='/Booking' element = {<Booking/>}/>
         <Route path='/Expired' element = {<ExpiredSubs/>}/>
         <Route path='/request' element = {<SubscriptionRequest/>}/>
         <Route path='/expiredRep' element = {<Expired/>}/>
         <Route path='/contact' element = {<Contact/>}/>
         <Route path='/rate' element = {<Rate/>}/>
         <Route path='/suspend' element = {<Suspended/>}/>
         <Route path='/active' element = {<Active/>}/>
         <Route path='/cancel' element = {<Cancel/>}/>
        <Route path="/" element={<Signup />} />
      </Routes>
    </Router>
  );
};

export default App;
