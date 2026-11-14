
import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import './App.css';

const API_URL = 'http://localhost:3002/api/shipments';

function ShipmentRow({ shipment }) {
  return (
    <tr>
      <td>{shipment.id}</td>
      <td>{shipment.receiver}</td>
      <td>{shipment.destination}</td>
      <td>
        <span className={`status ${shipment.status.replace(' ', '-')}`}>
          {shipment.status}
        </span>
      </td>
      <td>{shipment.courier || 'SwiftTrack'}</td>
      <td>{shipment.date || 'Not specified'}</td>
    </tr>
  );
}

function Header() {
  return (
    <header className="header">
      <Link to="/" className="brand">
        Swift<span>Track</span>
      </Link>

      <nav>
        <Link to="/">Home</Link>
        <Link to="/track">Track Shipment</Link>
        <Link to="/shipments">Shipments</Link>
      </nav>
    </header>
  );
}

function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">SMARTER COURIER MANAGEMENT</p>
      <h1>Your package.<br />Tracked every step.</h1>
      <p>Reliable delivery tracking, all in one place.</p>
      <Link to="/track" className="hero-link">
        Track Your Package
      </Link>
    </section>
  );
}

function TrackShipment({ shipments }) {
  const [trackingId, setTrackingId] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [message, setMessage] = useState('');

  function handleTrack(event) {
    event.preventDefault();

    if (!trackingId.trim()) {
      setMessage('Please enter a tracking ID.');
      setSelectedShipment(null);
      return;
    }

    const shipment = shipments.find(
      item => item.id.toLowerCase() === trackingId.trim().toLowerCase()
    );

    if (shipment) {
      setSelectedShipment(shipment);
      setMessage('Shipment found successfully!');
    } else {
      setSelectedShipment(null);
      setMessage('Shipment not found. Please check your tracking ID.');
    }
  }

  return (
    <section className="result-section">
      <h2>Track Your Shipment</h2>

      <form className="tracking-form" onSubmit={handleTrack}>
        <input
          type="text"
          placeholder="Enter tracking ID (e.g. ST3001)"
          value={trackingId}
          onChange={event => setTrackingId(event.target.value)}
        />
        <button type="submit">Track Package</button>
      </form>

      <p className="message">{message}</p>

      <div className="result-card">
        {selectedShipment ? (
          <>
            <h3>{selectedShipment.id}</h3>
            <p><strong>Receiver:</strong> {selectedShipment.receiver}</p>
            <p><strong>Destination:</strong> {selectedShipment.destination}</p>
            <p><strong>Status:</strong> {selectedShipment.status}</p>
            <p><strong>Courier:</strong> {selectedShipment.courier || 'SwiftTrack'}</p>
            <p><strong>Expected Delivery:</strong> {selectedShipment.date || 'Not specified'}</p>
          </>
        ) : (
          <p>Enter a tracking ID to view shipment details.</p>
        )}
      </div>
    </section>
  );
}

function Shipments({ shipments, onAddShipment, loading, error }) {
  const [filter, setFilter] = useState('All');
  const [id, setId] = useState('');
  const [receiver, setReceiver] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('Pending');
  const [message, setMessage] = useState('');

  const filteredShipments =
    filter === 'All'
      ? shipments
      : shipments.filter(shipment => shipment.status === filter);

  async function handleAddShipment(event) {
    event.preventDefault();
    setMessage('');

    if (!id.trim() || !receiver.trim() || !destination.trim()) {
      setMessage('Please fill in all shipment fields.');
      return;
    }

    const result = await onAddShipment({
      id: id.trim().toUpperCase(),
      receiver: receiver.trim(),
      destination: destination.trim(),
      status
    });

    setMessage(result.message);

    if (result.success) {
      setId('');
      setReceiver('');
      setDestination('');
      setStatus('Pending');
    }
  }

  return (
    <section className="shipments-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">SHIPMENT OVERVIEW</p>
          <h2>All Shipments</h2>
        </div>

        <select
          value={filter}
          onChange={event => setFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      <div className="result-card">
        <h3>Add New Shipment</h3>

        <form className="tracking-form" onSubmit={handleAddShipment}>
          <input
            type="text"
            placeholder="Tracking ID"
            value={id}
            onChange={event => setId(event.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Receiver Name"
            value={receiver}
            onChange={event => setReceiver(event.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Destination"
            value={destination}
            onChange={event => setDestination(event.target.value)}
            required
          />

          <select
            value={status}
            onChange={event => setStatus(event.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>

          <button type="submit">Save Shipment</button>
        </form>

        <p className="message">{message}</p>
      </div>

      {loading && <p>Loading shipments from MongoDB...</p>}
      {error && <p className="message">{error}</p>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Receiver</th>
              <th>Destination</th>
              <th>Status</th>
              <th>Courier</th>
              <th>Delivery Date</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filteredShipments.length === 0 ? (
              <tr>
                <td colSpan="6">No shipments found.</td>
              </tr>
            ) : (
              filteredShipments.map(shipment => (
                <ShipmentRow key={shipment.id} shipment={shipment} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function NotFound() {
  return (
    <section className="result-section">
      <h2>404 - Page Not Found</h2>
      <Link to="/">Return to Home</Link>
    </section>
  );
}

function App() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch shipment records from MongoDB through Express
  async function fetchShipments() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Unable to retrieve shipments.');
      }

      const data = await response.json();
      setShipments(data);
    } catch (error) {
      setError('Could not connect to the server. Please check that Express is running.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchShipments();
  }, []);

  // Add a new shipment to MongoDB through Express
  async function addShipment(shipment) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shipment)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Unable to save shipment.'
        };
      }

      setShipments(previous => [...previous, data.shipment]);

      return {
        success: true,
        message: 'Shipment saved successfully to MongoDB!'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Server connection failed. Please try again.'
      };
    }
  }

  return (
    <BrowserRouter>
      <div className="app">
        <Header />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route
              path="/track"
              element={<TrackShipment shipments={shipments} />}
            />

            <Route
              path="/shipments"
              element={
                <Shipments
                  shipments={shipments}
                  onAddShipment={addShipment}
                  loading={loading}
                  error={error}
                />
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer>
          <p>© 2026 SwiftTrack Courier Services. All rights reserved.</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;