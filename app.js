const fs = require('fs');
const express = require('express');

const app = express();

// express.json() is middleware that adds data from body to request obj
app.use(express.json());

// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res.send('You can post to this URL endpoint...');
// })

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

app.post('/api/v1/tours', (req, res) => {
  // console.log(req.body);
  const newId = toursObj[toursObj.length - 1].id + 1;
  const newTour = { id: newId, ...req.body };
  toursObj.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(toursObj),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          toursObj: newTour,
        },
      });
      console.log('New tour saved');
    }
  );
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
