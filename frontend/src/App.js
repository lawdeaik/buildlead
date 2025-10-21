import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import MagnetBuilder from './components/MagnetBuilder';
import Paywall from './components/Paywall';
import Success from './components/Success';
import './App.css';

function App() {
  const [usesRemaining, setUsesRemaining] = useState(1);
  const [isPaid, setIsPaid] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check localStorage for usage count, payment status, and email
    const storedUses = localStorage.getItem('buildlead_uses');
    const storedPaid = localStorage.getItem('buildlead_paid');
    const storedEmail = localStorage.getItem('buildlead_email');
    
    if (storedUses !== null) {
      setUsesRemaining(parseInt(storedUses));
    }
    
    if (storedPaid === 'true') {
      setIsPaid(true);
    }

    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const decrementUses = () => {
    if (!isPaid && usesRemaining > 0) {
      const newUses = usesRemaining - 1;
      setUsesRemaining(newUses);
      localStorage.setItem('buildlead_uses', newUses.toString());
    }
  };

  const saveEmail = (email) => {
    setUserEmail(email);
    localStorage.setItem('buildlead_email', email);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={<HomePage usesRemaining={usesRemaining} isPaid={isPaid} />} 
          />
          <Route 
            path="/builder" 
            element={
              usesRemaining > 0 || isPaid ? (
                <MagnetBuilder 
                  decrementUses={decrementUses} 
                  usesRemaining={usesRemaining}
                  isPaid={isPaid}
                  userEmail={userEmail}
                  saveEmail={saveEmail}
                />
              ) : (
                <Paywall />
              )
            } 
          />
          <Route path="/paywall" element={<Paywall />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;