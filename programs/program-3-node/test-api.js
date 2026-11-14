const http = require('http');

const newShipment = {
    id: 'ST1004',
    receiver: 'Ananya Desai',
    destination: 'Hyderabad',
    status: 'Pending'
};

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/shipments',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

const request = http.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
        data += chunk;
    });

    response.on('end', () => {
        console.log('HTTP Status:', response.statusCode);
        console.log('Server Response:', data);
    });
});

request.on('error', (error) => {
    console.error('Request failed:', error.message);
});

request.write(JSON.stringify(newShipment));
request.end();