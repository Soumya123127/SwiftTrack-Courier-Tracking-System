const http = require('http');

const shipmentData = JSON.stringify({
    id: 'ST3001',
    receiver: 'Ananya Desai',
    destination: 'Hyderabad',
    status: 'Pending'
});

const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/shipments',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(shipmentData)
    }
};

const request = http.request(options, (response) => {
    let data = '';

    response.on('data', chunk => data += chunk);

    response.on('end', () => {
        console.log('HTTP Status:', response.statusCode);
        console.log('Server Response:', data);
    });
});

request.on('error', error => {
    console.error('Request failed:', error.message);
});

request.write(shipmentData);
request.end();