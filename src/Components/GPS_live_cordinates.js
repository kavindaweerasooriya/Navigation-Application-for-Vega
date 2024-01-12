//Gps_module.js
const express = require('express');
const http = require('http');
const { SerialPort, ReadlineParser } = require('serialport');
const GPS = require('gps');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const port1 = 3001;

const path = 'COM8';
const baudRate = 115200;
const port = new SerialPort({ path, baudRate });
const parser = new ReadlineParser();
port.pipe(parser);

const gps = new GPS();

port.on('open', () => {
  console.log('Serial Port Opened');
});

let latestData = ''; 


parser.on('data', (data) => {
  console.log(data);

  // if (data.startsWith('$GNGGA') || data.startsWith('$GNRMC')) {
    gps.update(data);

      const Latitude = gps.state.lat;
      const Longitude = gps.state.lon;
      const Track = gps.state.track;
      const speed = gps.state.speed;

      latestData = { latitude: Latitude, longitude: Longitude, track: Track, speed: speed};

      // console.log('Speed:', speed);
      // console.log('Latitude:', Latitude);
      // console.log('Longitude:', Longitude);
      // console.log('Track:', Track);


  // }
});
app.get('/data', (req, res) => {
  res.json({ data: latestData });
  console.log("data transferred");
  console.log(latestData);
});

server.listen(port1, () => {
  console.log(`Server is running on port ${port1}`);
});
