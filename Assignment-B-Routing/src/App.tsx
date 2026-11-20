import { useState } from "react";
import {
  Routes,
  Route,
  Link,
  Outlet,
  useParams,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./App.css";

type Hotel = {
  id: number;
  name: string;
  location: string;
  price: number;
  description: string;
};

type Traveller = {
  name: string;
  email: string;
};

const hotels: Hotel[] = [
  {
    id: 1,
    name: "Grand Palace Hotel",
    location: "Bangalore",
    price: 3500,
    description: "A comfortable luxury hotel with modern facilities.",
  },
  {
    id: 2,
    name: "Ocean View Resort",
    location: "Goa",
    price: 5000,
    description: "Enjoy a relaxing stay near the beautiful beach.",
  },
  {
    id: 3,
    name: "Mountain Paradise",
    location: "Ooty",
    price: 2800,
    description: "A peaceful mountain resort surrounded by nature.",
  },
];

// Navigation bar
function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">TravelBook</Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/hotels">Hotels</Link>
        <Link to="/cart">Cart</Link>
      </div>
    </nav>
  );
}

// Home page
function Home() {
  return (
    <div className="hero">
      <h1>Explore the World With Us</h1>
      <p>Find your perfect hotel and enjoy your next journey.</p>
      <Link to="/hotels" className="btn">Explore Hotels</Link>
    </div>
  );
}

// Hotel listing page
function Hotels({
  addToCart,
}: {
  addToCart: (hotel: Hotel) => void;
}) {
  return (
    <div className="page">
      <h1>Available Hotels</h1>

      <div className="hotel-grid">
        {hotels.map((hotel) => (
          <div className="hotel-card" key={hotel.id}>
            <div className="hotel-image">🏨</div>
            <h2>{hotel.name}</h2>
            <p>📍 {hotel.location}</p>
            <h3>₹{hotel.price} / night</h3>

            <Link to={`/hotels/${hotel.id}`} className="btn">
              View Details
            </Link>

            <button onClick={() => addToCart(hotel)}>
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Hotel details page
function HotelDetails({
  addToCart,
}: {
  addToCart: (hotel: Hotel) => void;
}) {
  const { id } = useParams();
  const hotel = hotels.find((item) => item.id === Number(id));

  if (!hotel) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="page">
      <div className="details-card">
        <div className="hotel-image large">🏨</div>
        <h1>{hotel.name}</h1>
        <p>📍 {hotel.location}</p>
        <p>{hotel.description}</p>
        <h2>₹{hotel.price} / night</h2>

        <button onClick={() => addToCart(hotel)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// Cart page
function Cart({
  cart,
  removeFromCart,
}: {
  cart: Hotel[];
  removeFromCart: (id: number) => void;
}) {
  return (
    <div className="page">
      <h1>Your Shopping Cart</h1>

      {cart.length === 0 ? (
        <>
          <p>Your cart is empty.</p>
          <Link to="/hotels" className="btn">Explore Hotels</Link>
        </>
      ) : (
        <>
          {cart.map((hotel) => (
            <div className="cart-item" key={hotel.id}>
              <div>
                <h3>{hotel.name}</h3>
                <p>{hotel.location}</p>
                <strong>₹{hotel.price} / night</strong>
              </div>

              <button
                className="remove-btn"
                onClick={() => removeFromCart(hotel.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <h2>
            Total: ₹{cart.reduce((sum, hotel) => sum + hotel.price, 0)}
          </h2>

          <Link to="/checkout/travellers" className="btn">
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  );
}

// Protected checkout route
function ProtectedRoute({ cart }: { cart: Hotel[] }) {
  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return <Outlet />;
}

// Shared checkout layout
function CheckoutLayout() {
  return (
    <div className="page">
      <h1>Checkout</h1>

      <div className="checkout-steps">
        <Link to="/checkout/travellers">1. Traveller Details</Link>
        <Link to="/checkout/payment">2. Payment</Link>
      </div>

      <Outlet />
    </div>
  );
}

// Traveller checkout page
function TravellerCheckout({
  traveller,
  setTraveller,
}: {
  traveller: Traveller;
  setTraveller: (data: Traveller) => void;
}) {
  const navigate = useNavigate();

  const [name, setName] = useState(traveller.name);
  const [email, setEmail] = useState(traveller.email);
  const [error, setError] = useState("");

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setTraveller({ name, email });
    navigate("/checkout/payment");
  };

  return (
    <form className="form-card" onSubmit={handleContinue}>
      <h2>Traveller Information</h2>

      <label>Full Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your full name"
      />

      <label>Email Address</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@example.com"
      />

      {error && <p className="error">{error}</p>}

      <button type="submit">Continue to Payment</button>
    </form>
  );
}

// Payment page
function Payment({
  traveller,
  cart,
  onConfirm,
}: {
  traveller: Traveller;
  cart: Hotel[];
  onConfirm: () => void;
}) {
  const total = cart.reduce((sum, hotel) => sum + hotel.price, 0);

  return (
    <div className="form-card">
      <h2>Payment Details</h2>

      <p><strong>Traveller:</strong> {traveller.name}</p>
      <p><strong>Email:</strong> {traveller.email}</p>
      <p><strong>Total Amount:</strong> ₹{total}</p>

      <p className="payment-note">
        This is a demonstration checkout. No real payment will be processed.
      </p>

      <button onClick={onConfirm}>Confirm Booking</button>
    </div>
  );
}

// Confirmation page
function Confirmation({ traveller }: { traveller: Traveller }) {
  return (
    <div className="confirmation">
      <h1>🎉 Booking Confirmed!</h1>
      <p>Thank you, {traveller.name}.</p>
      <p>Your demo booking has been completed successfully.</p>
      <Link to="/hotels" className="btn">Explore More Hotels</Link>
    </div>
  );
}

// 404 page
function NotFound() {
  return (
    <div className="confirmation">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn">Go Home</Link>
    </div>
  );
}

// Main application
function App() {
  const [cart, setCart] = useState<Hotel[]>([]);
  const [traveller, setTraveller] = useState<Traveller>({
    name: "",
    email: "",
  });

  const addToCart = (hotel: Hotel) => {
    setCart((current) => {
      if (current.some((item) => item.id === hotel.id)) {
        return current;
      }
      return [...current, hotel];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((current) => current.filter((hotel) => hotel.id !== id));
  };

  const confirmBooking = () => {
    setCart([]);
    window.location.href = "/confirmation";
  };

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/hotels"
          element={<Hotels addToCart={addToCart} />}
        />

        <Route
          path="/hotels/:id"
          element={<HotelDetails addToCart={addToCart} />}
        />

        <Route
          path="/cart"
          element={
            <Cart cart={cart} removeFromCart={removeFromCart} />
          }
        />

        <Route element={<ProtectedRoute cart={cart} />}>
          <Route path="/checkout" element={<CheckoutLayout />}>
            <Route
              path="travellers"
              element={
                <TravellerCheckout
                  traveller={traveller}
                  setTraveller={setTraveller}
                />
              }
            />

            <Route
              path="payment"
              element={
                traveller.name && traveller.email ? (
                  <Payment
                    traveller={traveller}
                    cart={cart}
                    onConfirm={confirmBooking}
                  />
                ) : (
                  <Navigate to="/checkout/travellers" replace />
                )
              }
            />
          </Route>
        </Route>

        <Route
          path="/confirmation"
          element={<Confirmation traveller={traveller} />}
        />

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
