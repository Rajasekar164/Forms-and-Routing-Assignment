
import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Link,
  Outlet,
  useParams,
  useNavigate,
  useSearchParams,
  Navigate,
} from "react-router-dom";
import "./App.css";

// TYPES
type Hotel = {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  description: string;
};

type CartItem = Hotel & {
  quantity: number;
};

type Traveller = {
  name: string;
  email: string;
};

// NAVBAR
function Navbar({ cartCount }: { cartCount: number }) {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">TravelBook.</Link>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/hotels">Hotels</Link>

        <Link to="/cart" className="cart-nav">
          Cart
          <span className="cart-badge">{cartCount}</span>
        </Link>
      </div>
    </nav>
  );
}

// HOME PAGE
function Home() {
  const destinations = [
    {
      name: "Goa",
      icon: "🏝️",
      description: "Beautiful beaches and coastal escapes.",
    },
    {
      name: "Ooty",
      icon: "⛰️",
      description: "Peaceful mountains and refreshing nature.",
    },
    {
      name: "Bangalore",
      icon: "🌆",
      description: "Modern luxury stays in the garden city.",
    },
    {
      name: "Munnar",
      icon: "🌿",
      description: "Explore beautiful tea gardens and valleys.",
    },
    {
      name: "Mysore",
      icon: "🏰",
      description: "Discover royal heritage and culture.",
    },
    {
      name: "Jaipur",
      icon: "🏛️",
      description: "Experience Rajasthan's royal beauty.",
    },
  ];

  return (
    <>
      <section className="hero">
        <p className="hero-tagline">YOUR JOURNEY BEGINS HERE</p>
        <h1>Find Your Perfect Stay.</h1>

        <p>
          Explore handpicked hotels, discover beautiful destinations
          and book your next getaway.
        </p>

        <Link to="/hotels" className="btn">
          Explore Hotels →
        </Link>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <span>EXPLORE THE BEAUTY</span>
          <h2>Where Would You Like to Go?</h2>
          <p>Choose a destination to discover available hotels.</p>
        </div>

        <div className="destination-grid">
          {destinations.map((destination) => (
            <Link
              to={`/hotels?location=${encodeURIComponent(destination.name)}`}
              className="destination-card"
              key={destination.name}
            >
              <span className="destination-icon">
                {destination.icon}
              </span>

              <div className="destination-info">
                <h3>{destination.name}</h3>
                <p>{destination.description}</p>
                <strong>View hotels →</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

// HOTEL CARD
function HotelCard({
  hotel,
  addToCart,
  isAdded,
}: {
  hotel: Hotel;
  addToCart: (hotel: Hotel) => void;
  isAdded: boolean;
}) {
  return (
    <article className="hotel-card">
      <img
        src={hotel.image}
        alt={hotel.name}
        className="hotel-photo"
      />

      <div className="hotel-content">
        <div className="hotel-rating">
          ★ {hotel.rating} / 5
        </div>

        <h2>{hotel.name}</h2>
        <p>📍 {hotel.location}</p>

        <p className="hotel-price">
          ₹{hotel.price.toLocaleString("en-IN")}
          <span> / night</span>
        </p>

        <div className="hotel-actions">
          <Link to={`/hotels/${hotel.id}`} className="btn">
            View Details
          </Link>

          <button
            className={isAdded ? "added-btn" : ""}
            disabled={isAdded}
            onClick={() => addToCart(hotel)}
          >
            {isAdded ? "✓ Added to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}

// HOTEL LISTING
function Hotels({
  hotels,
  loading,
  addToCart,
  cart,
}: {
  hotels: Hotel[];
  loading: boolean;
  addToCart: (hotel: Hotel) => void;
  cart: CartItem[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLocation = searchParams.get("location") || "";

  const filteredHotels = selectedLocation
    ? hotels.filter(
        (hotel) =>
          hotel.location.toLowerCase() ===
          selectedLocation.toLowerCase()
      )
    : hotels;

  const locations = [
    ...new Set(hotels.map((hotel) => hotel.location)),
  ].sort();

  return (
    <div className="page">
      <div className="section-heading">
        <span>FIND YOUR PERFECT STAY</span>

        <h2>
          {selectedLocation
            ? `Hotels in ${selectedLocation}`
            : "Discover Our Hotels"}
        </h2>

        <p>Handpicked stays for a memorable experience.</p>
      </div>

      <div className="filter-bar">
        <label htmlFor="location-filter">
          Choose Destination
        </label>

        <select
          id="location-filter"
          value={selectedLocation}
          onChange={(e) => {
            if (e.target.value) {
              setSearchParams({ location: e.target.value });
            } else {
              setSearchParams({});
            }
          }}
        >
          <option value="">All Destinations</option>

          {locations.map((location) => (
            <option value={location} key={location}>
              {location}
            </option>
          ))}
        </select>

        {selectedLocation && (
          <button
            className="clear-filter"
            onClick={() => setSearchParams({})}
          >
            Clear Filter
          </button>
        )}
      </div>

      {loading ? (
        <p className="loading-message">Loading hotels...</p>
      ) : filteredHotels.length === 0 ? (
        <div className="empty-state">
          <h2>No hotels found</h2>
          <p>
            We currently don't have hotels listed in this destination.
          </p>
          <Link to="/hotels" className="btn">
            View All Hotels
          </Link>
        </div>
      ) : (
        <>
          <p className="results-count">
            Showing {filteredHotels.length} hotels
          </p>

          <div className="hotel-grid">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                addToCart={addToCart}
                isAdded={cart.some(
                  (item) => item.id === hotel.id
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// HOTEL DETAILS
function HotelDetails({
  hotels,
  addToCart,
  loading,
  cart,
}: {
  hotels: Hotel[];
  addToCart: (hotel: Hotel, quantity?: number) => void;
  loading: boolean;
  cart: CartItem[];
}) {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);

  const hotel = hotels.find(
    (item) => item.id === Number(id)
  );

  if (loading) {
    return <div className="page">Loading hotel details...</div>;
  }

  if (!hotel) {
    return <Navigate to="/404" replace />;
  }

  const isAdded = cart.some(
    (item) => item.id === hotel.id
  );

  return (
    <div className="page">
      <div className="details-card">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="details-photo"
        />

        <div className="details-content">
          <div className="hotel-rating">
            ★ {hotel.rating} / 5
          </div>

          <h1>{hotel.name}</h1>
          <p>📍 {hotel.location}</p>
          <p>{hotel.description}</p>

          <h2>
            ₹{hotel.price.toLocaleString("en-IN")} / room / night
          </h2>

          <div className="room-quantity">
            <label htmlFor="room-quantity">Number of rooms</label>

            <select
              id="room-quantity"
              value={quantity}
              disabled={isAdded}
              onChange={(event) =>
                setQuantity(Number(event.target.value))
              }
            >
              {Array.from(
                { length: 10 },
                (_, index) => index + 1
              ).map((number) => (
                <option key={number} value={number}>
                  {number} {number === 1 ? "Room" : "Rooms"}
                </option>
              ))}
            </select>

            <p>
              Total per night:{" "}
              <strong>
                ₹{(hotel.price * quantity).toLocaleString("en-IN")}
              </strong>
            </p>
          </div>

          <button
            className={isAdded ? "added-btn" : ""}
            disabled={isAdded}
            onClick={() => addToCart(hotel, quantity)}
          >
            {isAdded
              ? "✓ Added to Cart"
              : `Add ${quantity} ${quantity === 1 ? "Room" : "Rooms"} to Cart`}
          </button>

          <Link to="/cart" className="back-link">
            View Cart →
          </Link>
        </div>
      </div>
    </div>
  );
}

// CART
function Cart({
  cart,
  removeFromCart,
  updateRoomQuantity,
}: {
  cart: CartItem[];
  removeFromCart: (id: number) => void;
  updateRoomQuantity: (id: number, change: number) => void;
}) {
  const total = cart.reduce(
    (sum, hotel) => sum + hotel.price * hotel.quantity,
    0
  );

  return (
    <div className="page cart-page">
      <div className="cart-heading">
        <span>YOUR BOOKING</span>
        <h1>Your Shopping Cart</h1>
        <p>Review your selected stays before checkout.</p>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <div className="empty-cart-icon">🛍️</div>
          <h2>Your cart is empty</h2>
          <p>You haven't selected any hotels yet.</p>

          <Link to="/hotels" className="btn">
            Explore Hotels →
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cart.map((hotel) => (
              <div className="cart-item" key={hotel.id}>
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="cart-photo"
                />

                <div className="cart-item-info">
                  <h3>{hotel.name}</h3>
                  <p>📍 {hotel.location}</p>

                  {/* PRICE AND QUANTITY IN ONE ROW */}
                  <div className="cart-price-quantity">
                    <strong>
                      ₹{hotel.price.toLocaleString("en-IN")} / room / night
                    </strong>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          updateRoomQuantity(hotel.id, -1)
                        }
                        disabled={hotel.quantity <= 1}
                        aria-label="Decrease room quantity"
                      >
                        −
                      </button>

                      <span>{hotel.quantity}</span>

                      <button
                        type="button"
                        onClick={() =>
                          updateRoomQuantity(hotel.id, 1)
                        }
                        aria-label="Increase room quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <p>
                    Subtotal per night: ₹
                    {(hotel.price * hotel.quantity).toLocaleString("en-IN")}
                  </p>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(hotel.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h2>Booking Summary</h2>

            <div className="summary-line">
              <span>Selected hotels</span>
              <strong>{cart.length}</strong>
            </div>

            <div className="summary-line">
              <span>Room total per night</span>
              <strong>
                ₹{total.toLocaleString("en-IN")}
              </strong>
            </div>

            <div className="summary-total">
              <span>Total per night</span>
              <strong>
                ₹{total.toLocaleString("en-IN")}
              </strong>
            </div>

            <Link
              to="/checkout/travellers"
              className="btn checkout-btn"
            >
              Proceed to Checkout →
            </Link>

            <Link to="/hotels" className="continue-shopping">
              Continue exploring hotels
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}

// PROTECTED CHECKOUT
function ProtectedRoute({ cart }: { cart: CartItem[] }) {
  return cart.length === 0
    ? <Navigate to="/cart" replace />
    : <Outlet />;
}

// CHECKOUT LAYOUT
function CheckoutLayout() {
  return (
    <div className="page">
      <div className="section-heading">
        <span>ALMOST THERE</span>
        <h2>Complete Your Booking</h2>
      </div>

      <div className="checkout-steps">
        <Link to="/checkout/travellers">
          1. Traveller Details
        </Link>

        <Link to="/checkout/payment">
          2. Payment
        </Link>
      </div>

      <Outlet />
    </div>
  );
}

// TRAVELLER CHECKOUT
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

    setTraveller({
      name: name.trim(),
      email: email.trim(),
    });

    navigate("/checkout/payment");
  };

  return (
    <form
      className="form-card"
      onSubmit={handleContinue}
      noValidate
    >
      <h2>Traveller Information</h2>

      <label htmlFor="traveller-name">Full Name</label>
      <input
        id="traveller-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your full name"
      />

      <label htmlFor="traveller-email">Email Address</label>
      <input
        id="traveller-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@example.com"
      />

      {error && <p className="error">{error}</p>}

      <button type="submit">
        Continue to Payment →
      </button>
    </form>
  );
}

// PAYMENT
function Payment({
  traveller,
  cart,
  onConfirm,
}: {
  traveller: Traveller;
  cart: CartItem[];
  onConfirm: () => void;
}) {
  const total = cart.reduce(
    (sum, hotel) => sum + hotel.price * hotel.quantity,
    0
  );

  return (
    <div className="form-card">
      <h2>Booking Summary</h2>

      <p>
        <strong>Traveller:</strong> {traveller.name}
      </p>

      <p>
        <strong>Email:</strong> {traveller.email}
      </p>

      <hr />

      {cart.map((hotel) => (
        <p key={hotel.id}>
          {hotel.name} — {hotel.quantity} rooms × ₹
          {hotel.price.toLocaleString("en-IN")} = ₹
          {(hotel.price * hotel.quantity).toLocaleString("en-IN")} / night
        </p>
      ))}

      <h2>
        Total: ₹{total.toLocaleString("en-IN")} / night
      </h2>

      <p className="payment-note">
        Demonstration checkout only. No real payment will be processed.
      </p>

      <button onClick={onConfirm}>
        Confirm Booking
      </button>
    </div>
  );
}

// CONFIRMATION
function Confirmation({ traveller }: { traveller: Traveller }) {
  return (
    <div className="confirmation">
      <h1>🎉 Booking Confirmed!</h1>
      <p>Thank you, {traveller.name}.</p>
      <p>Your demo booking has been completed successfully.</p>

      <Link to="/hotels" className="btn">
        Explore More Hotels
      </Link>
    </div>
  );
}

// 404 PAGE
function NotFound() {
  return (
    <div className="confirmation">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>

      <Link to="/" className="btn">
        Go Home
      </Link>
    </div>
  );
}

// MAIN APP
function App() {
  const navigate = useNavigate();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);

  const [traveller, setTraveller] = useState<Traveller>({
    name: "",
    email: "",
  });

  const [toast, setToast] = useState("");

  // FETCH HOTELS FROM JSON
  useEffect(() => {
    fetch("/hotels.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load hotel data.");
        }

        return response.json();
      })
      .then((data: Hotel[]) => {
        setHotels(data);
        setLoadError("");
      })
      .catch(() => {
        setLoadError(
          "Unable to load hotels. Please refresh the page."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ADD HOTEL TO CART
  const addToCart = (hotel: Hotel, quantity = 1) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.id === hotel.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === hotel.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      return [...current, { ...hotel, quantity }];
    });

    setToast(
      `${quantity} ${quantity === 1 ? "room" : "rooms"} at ${hotel.name} added to your cart!`
    );
  };

  // REMOVE HOTEL FROM CART
  const removeFromCart = (id: number) => {
    setCart((current) =>
      current.filter((hotel) => hotel.id !== id)
    );
  };

  // UPDATE ROOM QUANTITY
  const updateRoomQuantity = (id: number, change: number) => {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + change),
            }
          : item
      )
    );
  };

  // CLEAR TOAST AFTER 2.5 SECONDS
  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [toast]);

  // CONFIRM BOOKING
  const confirmBooking = () => {
    setCart([]);
    navigate("/confirmation");
  };

  return (
    <>
      <Navbar
        cartCount={cart.reduce(
          (sum, item) => sum + item.quantity,
          0
        )}
      />

      {toast && (
        <div className="toast-notification">
          <span>✓</span>
          {toast}
          <Link to="/cart">View Cart →</Link>
        </div>
      )}

      {loadError ? (
        <div className="page error-state">{loadError}</div>
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/hotels"
            element={
              <Hotels
                hotels={hotels}
                loading={loading}
                addToCart={addToCart}
                cart={cart}
              />
            }
          />

          <Route
            path="/hotels/:id"
            element={
              <HotelDetails
                hotels={hotels}
                loading={loading}
                addToCart={addToCart}
                cart={cart}
              />
            }
          />

          <Route
            path="/cart"
            element={
              <Cart
                cart={cart}
                removeFromCart={removeFromCart}
                updateRoomQuantity={updateRoomQuantity}
              />
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
                    <Navigate
                      to="/checkout/travellers"
                      replace
                    />
                  )
                }
              />
            </Route>
          </Route>

          <Route
            path="/confirmation"
            element={
              <Confirmation traveller={traveller} />
            }
          />

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </>
  );
}

export default App;
