import { useState , useEffect } from "react";

function App() {

  const [customerName, setCustomerName] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [checkIn, setCheckInName] = useState("");
  const [checkOut, setCheckOutName] = useState("");
  const [bookings, setBookings] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

    useEffect(() => {

  fetch("http://localhost:5000/bookings")

    .then((response) => response.json())

    .then((data) => {

      setBookings(data);

    });

}, []);

const handleBooking = () => {

  const newBooking = {

    customerName,
    hotelName,
    checkIn,
    checkOut

  };

  console.log("Fetch running");

  const today = new Date().toISOString().split("T")[0];
  if(checkIn < today ){
    alert("Past check-ins dates are not allowed");
    return ;
  } 
  if(checkOut<checkIn){
    alert("Check-out cannot be before check-in");
    return ; 
  }

  if (editingIndex !== null) {

    fetch(`http://localhost:5000/bookings/${editingIndex}`, {

      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(newBooking),

    })

    .then(() => {

      setEditingIndex(null);

      window.location.reload();

    });

  }

  else {

    fetch("http://localhost:5000/bookings", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(newBooking),

    })

    .then(() => {

      window.location.reload();

    });

  }

};

return (

    <div>

      <h1>Hotel booking</h1>

      <input
        type="text"
        placeholder="Enter customer name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="text"
        placeholder="Enter hotel name"
        value={hotelName}
        onChange={(e) => setHotelName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="date"
        value={checkIn}
        onChange={(e) => setCheckInName(e.target.value)}
      />

      <br />
      <br />

      <input
        type="date"
        value={checkOut}
        onChange={(e) => setCheckOutName(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleBooking}>
        Book now
      </button>

      {

        bookings.map((booking, index) => (

          <div key={index}>

            <h3>{booking.customer_name}</h3>
            <h3>{booking.hotel_name}</h3>
            <h3>{booking.check_in.split("T")[0]}</h3>
            <h3>{booking.check_out.split("T")[0]}</h3>

            <button>
              Delete
            </button>

            <button
              onClick={() => {

                setEditingIndex(booking.id);

                setCustomerName(booking.customer_name);
                setHotelName(booking.hotel_name);
                setCheckInName(booking.check_in.split("T")[0]);
                setCheckOutName(booking.check_out.split("T")[0]);

              }}
            >
              Edit
            </button>

          </div>

        ))

      }

    </div>

  );

}
export default App;
