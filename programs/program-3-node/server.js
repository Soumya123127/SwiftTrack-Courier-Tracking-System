
const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// Create an event emitter
const shipmentEvents = new EventEmitter();

// File paths
const dataDirectory = path.join(__dirname, 'data');
const dataFile = path.join(dataDirectory, 'shipments.json');

// Create data folder if it does not exist
if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
}

// Create initial shipment data if the file does not exist
if (!fs.existsSync(dataFile)) {
    const initialShipments = [
        {
            id: 'ST1001',
            receiver: 'Aarav Sharma',
            destination: 'Mumbai',
            status: 'In Transit'
        },
        {
            id: 'ST1002',
            receiver: 'Priya Patel',
            destination: 'Pune',
            status: 'Delivered'
        },
        {
            id: 'ST1003',
            receiver: 'Rahul Mehta',
            destination: 'Delhi',
            status: 'Pending'
        }
    ];

    fs.writeFileSync(
        dataFile,
        JSON.stringify(initialShipments, null, 2)
    );
}

// Read shipment records
function getShipments() {
    try {
        const fileContent = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading shipment data:', error.message);
        return [];
    }
}

// Save shipment records
function saveShipments(shipments) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(shipments, null, 2)
    );
}

// Listen for shipment update events
shipmentEvents.on('shipmentUpdated', (shipment) => {
    console.log(
        `Shipment ${shipment.id} updated to: ${shipment.status}`
    );
});

// Process an update using a readable stream
function processShipmentUpdates() {
    const shipments = getShipments();

    const shipmentStream = fs.createReadStream(dataFile, {
        encoding: 'utf8'
    });

    shipmentStream.on('data', (chunk) => {
        console.log('Shipment data stream received:', chunk.length, 'characters');
    });

    shipmentStream.on('end', () => {
        console.log('Shipment stream processing completed.');

        if (shipments.length > 0) {
            shipmentEvents.emit('shipmentUpdated', shipments[0]);
        }
    });

    shipmentStream.on('error', (error) => {
        console.error('Stream error:', error.message);
    });
}

// Create HTTP server without Express
const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'GET' && req.url === '/shipments') {
        const shipments = getShipments();

        res.writeHead(200);
        res.end(JSON.stringify(shipments));
        return;
    }

    if (req.method === 'POST' && req.url === '/shipments') {
        let requestBody = '';

        req.on('data', (chunk) => {
            requestBody += chunk;
        });

        req.on('end', () => {
            try {
                const newShipment = JSON.parse(requestBody);

                if (
                    !newShipment.id ||
                    !newShipment.receiver ||
                    !newShipment.destination ||
                    !newShipment.status
                ) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        message: 'All shipment fields are required.'
                    }));
                    return;
                }

                const shipments = getShipments();

                if (shipments.some(item => item.id === newShipment.id)) {
                    res.writeHead(409);
                    res.end(JSON.stringify({
                        message: 'Shipment ID already exists.'
                    }));
                    return;
                }

                shipments.push(newShipment);
                saveShipments(shipments);

                res.writeHead(201);
                res.end(JSON.stringify({
                    message: 'Shipment created successfully.',
                    shipment: newShipment
                }));
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({
                    message: 'Invalid JSON request body.'
                }));
            }
        });

        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({
        message: 'Route not found.'
    }));
});

// Start the server
const PORT = 3001;

server.listen(PORT, () => {
    console.log(`SwiftTrack Node.js server running at http://localhost:${PORT}`);
    console.log('Available route: GET /shipments');
    console.log('Available route: POST /shipments');

    processShipmentUpdates();
});