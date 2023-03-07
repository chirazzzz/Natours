const fs = require('fs');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hello from the server side!', app: 'Natours' });
});

app.post('/', (req, res) => {
  res.send('You can post to this URL endpoint...');
})

const tours = fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`);
const toursObj = JSON.parse(tours);

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: toursObj.length,
    data: {
      tours: toursObj,
    },
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
