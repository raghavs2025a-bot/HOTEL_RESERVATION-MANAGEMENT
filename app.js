// StayEase frontend booking system

const STORAGE_KEY = "stayease_bookings";
const SELECTED_HOTEL_KEY = "stayease_selected_hotel";

// -----------------------------
// Booking storage
// -----------------------------

function getBookings() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveBookings(bookings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function getSelectedHotel() {
    return JSON.parse(
        localStorage.getItem(SELECTED_HOTEL_KEY) || "null"
    );
}

function setSelectedHotel(hotel) {
    localStorage.setItem(
        SELECTED_HOTEL_KEY,
        JSON.stringify(hotel)
    );
}


// -----------------------------
// Hotel selection
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {

    // Find Book Now buttons
    const bookingButtons = document.querySelectorAll(
        'a[href="booking.html"], a[href="booking-form.html"], .book-now, .book-button'
    );

    bookingButtons.forEach(button => {

        button.addEventListener("click", function (event) {

            // Try to find hotel card
            const card = this.closest(
                ".hotel-card, .hotel-item, .hotel-result, .booking-card"
            );

            if (card) {

                const nameElement = card.querySelector(
                    ".hotel-name, .hotel-title, h2, h3"
                );

                const priceElement = card.querySelector(
                    ".hotel-price, .price, .price-amount"
                );

                const hotel = {
                    name: nameElement
                        ? nameElement.textContent.trim()
                        : "Selected Hotel",

                    price: priceElement
                        ? priceElement.textContent.trim()
                        : "",

                    selectedAt: new Date().toISOString()
                };

                setSelectedHotel(hotel);
            }

            // Fix old booking.html links
            const href = this.getAttribute("href");

            if (href === "booking.html") {
                event.preventDefault();
                window.location.href = "booking-form.html";
            }
        });
    });


    // -----------------------------
    // Booking form
    // -----------------------------

    const form = document.querySelector("form");

    if (
        form &&
        window.location.pathname.includes("booking-form")
    ) {

        form.addEventListener("submit", function (event) {

            event.preventDefault();

            const formData = new FormData(form);
            const selectedHotel = getSelectedHotel();

            const booking = {
                id:
                    "SE-" +
                    Date.now().toString().slice(-8),

                hotel:
                    selectedHotel?.name ||
                    "StayEase Hotel",

                price:
                    selectedHotel?.price ||
                    "",

                guestName:
                    formData.get("name") ||
                    formData.get("fullName") ||
                    formData.get("guestName") ||
                    "",

                email:
                    formData.get("email") ||
                    "",

                phone:
                    formData.get("phone") ||
                    formData.get("mobile") ||
                    "",

                checkIn:
                    formData.get("checkIn") ||
                    "",

                checkOut:
                    formData.get("checkOut") ||
                    "",

                guests:
                    formData.get("guests") ||
                    formData.get("guestCount") ||
                    "1",

                status: "Confirmed",

                createdAt:
                    new Date().toISOString()
            };


            const bookings = getBookings();

            bookings.push(booking);

            saveBookings(bookings);

            // Keep latest booking available for confirmation page
            localStorage.setItem(
                "stayease_latest_booking",
                JSON.stringify(booking)
            );

            window.location.href = "confirmation.html";
        });
    }


    // -----------------------------
    // Confirmation page
    // -----------------------------

    if (
        window.location.pathname.includes("confirmation")
    ) {

        const booking = JSON.parse(
            localStorage.getItem(
                "stayease_latest_booking"
            ) || "null"
        );

        if (booking) {

            // Replace elements if matching classes exist
            setText(".confirmation-hotel", booking.hotel);
            setText(".booking-id", booking.id);
            setText(".guest-name", booking.guestName);
            setText(".guest-email", booking.email);
            setText(".guest-phone", booking.phone);
            setText(".check-in", booking.checkIn);
            setText(".check-out", booking.checkOut);
            setText(".guest-count", booking.guests);
            setText(".confirmation-status", booking.status);
        }
    }


    // -----------------------------
    // My Bookings page
    // -----------------------------

    if (
        window.location.pathname.includes("my-booking")
    ) {
        renderBookings();
    }

});


// -----------------------------
// Helper
// -----------------------------

function setText(selector, value) {

    const element = document.querySelector(selector);

    if (element && value) {
        element.textContent = value;
    }
}


// -----------------------------
// Render bookings
// -----------------------------

function renderBookings() {

    const bookings = getBookings();

    const container =
        document.querySelector(".bookings-container");

    if (!container) {
        return;
    }

    if (bookings.length === 0) {

        container.innerHTML = `
            <div style="
                background:white;
                padding:40px;
                border-radius:12px;
                text-align:center;
            ">
                <h3>No bookings yet</h3>
                <p style="margin:10px 0 20px;color:#666;">
                    Your confirmed hotel bookings will appear here.
                </p>

                <a
                    href="hotel-list.html"
                    style="
                        display:inline-block;
                        padding:12px 24px;
                        background:#FF6B35;
                        color:white;
                        text-decoration:none;
                        border-radius:8px;
                    "
                >
                    Find a Hotel
                </a>
            </div>
        `;

        return;
    }


    container.innerHTML = bookings
        .map(booking => {

            return `
                <div class="booking-card">

                    <div class="booking-image"></div>

                    <div class="booking-info">

                        <div class="booking-header">
                            <h3>
                                ${escapeHTML(booking.hotel)}
                            </h3>

                            <span style="
                                color:#10b981;
                                font-weight:600;
                            ">
                                ${escapeHTML(booking.status)}
                            </span>
                        </div>

                        <div>
                            <strong>Booking ID:</strong>
                            ${escapeHTML(booking.id)}
                        </div>

                        <div>
                            <strong>Guest:</strong>
                            ${escapeHTML(booking.guestName)}
                        </div>

                        <div>
                            <strong>Check-in:</strong>
                            ${escapeHTML(booking.checkIn)}
                        </div>

                        <div>
                            <strong>Check-out:</strong>
                            ${escapeHTML(booking.checkOut)}
                        </div>

                        <div>
                            <strong>Guests:</strong>
                            ${escapeHTML(booking.guests)}
                        </div>

                    </div>

                    <div>
                        <button
                            onclick="cancelBooking('${booking.id}')"
                            style="
                                padding:10px 16px;
                                border:1px solid #ddd;
                                background:white;
                                border-radius:6px;
                                cursor:pointer;
                            "
                        >
                            Cancel
                        </button>
                    </div>

                </div>
            `;

        })
        .join("");
}


// -----------------------------
// Cancel booking
// -----------------------------

function cancelBooking(id) {

    const bookings = getBookings();

    const updatedBookings = bookings.map(booking => {

        if (booking.id === id) {

            return {
                ...booking,
                status: "Cancelled"
            };
        }

        return booking;
    });

    saveBookings(updatedBookings);

    renderBookings();
}


// -----------------------------
// Security helper
// -----------------------------

function escapeHTML(value) {

    if (!value) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}