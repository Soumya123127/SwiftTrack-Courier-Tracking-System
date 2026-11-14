// SwiftTrack - HTTP Methods Demonstration

const API_URL = "https://jsonplaceholder.typicode.com/posts";

// GET: Retrieve shipment-style records
async function getShipments() {
    const response = await fetch(API_URL);
    const data = await response.json();

    console.log("GET Response:", data);
}

// POST: Create a new record
async function createShipment() {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: "New Shipment",
            body: "Shipment created successfully",
            userId: 1
        })
    });

    const data = await response.json();
    console.log("POST Response:", data);
}

// PUT: Update an existing record
async function updateShipment() {
    const response = await fetch(`${API_URL}/1`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: 1,
            title: "Updated Shipment",
            body: "Shipment status updated",
            userId: 1
        })
    });

    const data = await response.json();
    console.log("PUT Response:", data);
}

// DELETE: Delete a record
async function deleteShipment() {
    const response = await fetch(`${API_URL}/1`, {
        method: "DELETE"
    });

    console.log("DELETE Status:", response.status);
}

// Run all demonstrations
getShipments();
createShipment();
updateShipment();
deleteShipment();