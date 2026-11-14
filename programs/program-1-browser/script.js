
// SwiftTrack - Program 1: Browser-based Courier Tracking

const shipments = [
    {
        id: "ST1001",
        receiver: "Aarav Sharma",
        destination: "Mumbai",
        status: "In Transit",
        courier: "BlueDart",
        estimatedDelivery: "2026-11-16"
    },
    {
        id: "ST1002",
        receiver: "Priya Patel",
        destination: "Pune",
        status: "Delivered",
        courier: "Delhivery",
        estimatedDelivery: "2026-11-13"
    },
    {
        id: "ST1003",
        receiver: "Rahul Mehta",
        destination: "Delhi",
        status: "Pending",
        courier: "DTDC",
        estimatedDelivery: "2026-11-18"
    },
    {
        id: "ST1004",
        receiver: "Sneha Kulkarni",
        destination: "Bangalore",
        status: "In Transit",
        courier: "BlueDart",
        estimatedDelivery: "2026-11-17"
    },
    {
        id: "ST1005",
        receiver: "Kabir Shah",
        destination: "Nashik",
        status: "Delivered",
        courier: "India Post",
        estimatedDelivery: "2026-11-14"
    }
];

// Fetch API: load shipment data asynchronously
async function fetchShipments() {
    try {
        const response = await fetch(
            "data/shipments.json"
        );

        if (!response.ok) {
            throw new Error("Unable to load shipment data.");
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.warn(
            "Using sample shipment data:",
            error.message
        );

        return shipments;
    }
}

// Display all shipments
function displayShipments(data) {
    const table = document.getElementById("shipmentTable");

    table.innerHTML = "";

    data.forEach((shipment) => {
        const row = document.createElement("tr");

        const safeStatus = shipment.status.replace(/\s+/g, "-");

        row.innerHTML = `
            <td>${shipment.id}</td>
            <td>${shipment.receiver}</td>
            <td>${shipment.destination}</td>
            <td>
                <span class="status ${safeStatus}">
                    ${shipment.status}
                </span>
            </td>
        `;

        table.appendChild(row);
    });

    if (data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="4">No shipments found.</td>
            </tr>
        `;
    }
}

// Search for a shipment
async function trackShipment(trackingId) {
    const message = document.getElementById("message");
    const result = document.getElementById("trackingResult");

    if (!trackingId.trim()) {
        message.textContent = "Please enter a tracking ID.";
        result.innerHTML = "";
        return;
    }

    message.textContent = "Searching for your shipment...";

    const allShipments = await fetchShipments();

    const shipment = allShipments.find(
        (item) =>
            item.id.toLowerCase() === trackingId.trim().toLowerCase()
    );

    if (!shipment) {
        message.textContent = "No shipment found. Please check your tracking ID.";
        result.innerHTML = "<p>Shipment not found.</p>";
        return;
    }

    message.textContent = "Shipment found successfully!";

    result.innerHTML = `
        <h3>Shipment ${shipment.id}</h3>
        <p><strong>Receiver:</strong> ${shipment.receiver}</p>
        <p><strong>Destination:</strong> ${shipment.destination}</p>
        <p><strong>Status:</strong> ${shipment.status}</p>
        <p><strong>Courier:</strong> ${shipment.courier}</p>
        <p><strong>Estimated Delivery:</strong> ${shipment.estimatedDelivery}</p>
    `;
}

// Form submission and DOM event handling
document
    .getElementById("trackingForm")
    .addEventListener("submit", async (event) => {
        event.preventDefault();

        const trackingId = document
            .getElementById("trackingInput")
            .value;

        await trackShipment(trackingId);
    });

// Filter shipments by status
document
    .getElementById("statusFilter")
    .addEventListener("change", async (event) => {
        const selectedStatus = event.target.value;

        const allShipments = await fetchShipments();

        const filteredShipments =
            selectedStatus === "All"
                ? allShipments
                : allShipments.filter(
                    (shipment) => shipment.status === selectedStatus
                );

        displayShipments(filteredShipments);
    });

// Initialise the application
async function initialiseApp() {
    const allShipments = await fetchShipments();
    displayShipments(allShipments);
}

initialiseApp();