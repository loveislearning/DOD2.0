// src/ListingsApp.jsx
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

const API_URL = 'http://localhost:3000'; 

// --- 1. The Listing Card Component ---
// This replaces your old createListingCardHTML function
function ListingCard({ car, endpointType }) {
    const isRental = endpointType === 'rentals';
    const priceLabel = isRental ? 'Daily Price:' : 'Sale Price:';

    const actions = isRental 
        ? <div className="listing-actions">
              <button className="btn btn-success">Book Now</button>
              <button className="btn btn-secondary">Inquire</button>
           </div>
        : <div className="listing-actions">
              <button className="btn btn-primary">Edit</button>
              {/* NOTE: You will need to implement the actual delete handler here */}
              <button className="btn btn-danger delete-btn" data-id={car.id}>Delete</button> 
           </div>;

    return (
        <div className="listing-card" data-car-id={car.id}>
            <img src={car.image || 'placeholder.jpg'} alt={car.model} />
            <div className="listing-details">
                <h3>{car.model}</h3>
                <p>{priceLabel} {car.price}</p>
                <p>Type: {isRental ? 'RENT' : 'SALE'}</p>
                <p>Status: <span className="status active">Active</span></p>
            </div>
            {actions}
        </div>
    );
}

// --- 2. The Main React Application Component ---
function ListingsApp({ loggedInUserId, endpoint, title }) {
  const [data, setData] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null); 
      try {
        const url = endpoint === 'cars' 
          ? `${API_URL}/cars?userId=${loggedInUserId}` 
          : `${API_URL}/${endpoint}`;
          
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`Failed to fetch ${title}`);
        
        const json = await res.json();
        setData(json);
        
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(`❌ Server error loading ${title}.`);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [loggedInUserId, endpoint, title]);

  // --- Defensive Rendering Checks ---
  if (loading) return <p>Fetching {title} with React...</p>;
  
  if (error) return <p style={{color: 'red', fontWeight: 'bold'}}>{error}</p>;
  
  if (data.length === 0) return <h2>{`You currently have no ${title}.`}</h2>;

  // --- Actual Rendering ---
  return (
    <>
      {data.map(car => (
        <ListingCard 
          key={car.id} 
          car={car} 
          endpointType={endpoint}
        />
      ))}
    </>
  );
}

// --- 3. Global Function (The Bridge to Vanilla JS) ---
window.renderReactListings = (targetDomElement, loggedInUserId, endpoint) => {
    const root = ReactDOM.createRoot(targetDomElement);
    const title = endpoint === 'cars' ? 'My Listings' : 'Available Rentals';
    
    root.render(
      <React.StrictMode>
        <ListingsApp 
          loggedInUserId={loggedInUserId} 
          endpoint={endpoint}
          title={title}
        />
      </React.StrictMode>
    );
};