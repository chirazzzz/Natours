const dotenv = require('dotenv');
const app = require('./app');

dotenv.config({ path: './config.env' });


const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

const x = 23;
x = 40;