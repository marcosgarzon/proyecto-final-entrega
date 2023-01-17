
const mongoose = require('mongoose');

// const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.tmathxe.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.tmathxe.mongodb.net/ecommerce`;
mongoose.connect(uri)
  .then( () => console.log(`DB: ${process.env.MONGODB_DB} lista para usar`))
  .catch( err => console.log(err))

