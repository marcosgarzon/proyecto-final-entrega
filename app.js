
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session')
const flash = require('express-flash');

const mongoose = require('mongoose');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc')
const cluster = require('cluster');
const core = require('os');
const compression = require('compression');
const path = require('path'); 
const passport = require('passport');


const routerProductos = require('./routes/product.routes')
const routerCarrito = require('./routes/carrito.routes')
const routerLogin = require('./routes/login.routes')

const UserController = require('./controllers/user.controller.mongo')

const app = express();

let PORT = process.env.PORT || 8080;

const optionsSwagger = {
  definition:{
    openapi: '3.0.0', 
    info:{
      title: 'CoderHouse- Proyecto Final - Curso Backend',
      version: '1.0.0'
    },
    servers: [{url: 'http://localhost:8080'}]
  },
  apis: [`${path.join(__dirname, './routes/*.js')}`]
}

//////// Conexión MongoDB ////////
require('./database');
//////// Passport Local ////////
require('./passport/passportLocal');

//////////////////////// EJS //////////////////////////////
app.set('views', path.join(__dirname, 'views'));
app.set('view-engine', 'ejs');

//////////////////////// Middlewares //////////////////////////////
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(flash());
app.use(session({      
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false  
}))
app.use(passport.initialize())
app.use(passport.session());
app.use(compression());

if(cluster.isPrimary) {
  for (let i = 0; i < core.cpus().length; i++) {
    cluster.fork()    
  }

  // reemplazar workers en caso de que mueran
  cluster.on('exit',() => cluster.fork())
} else{

  ////////////// Rutas //////////////  
  app.use('/api/productos', routerProductos);
  app.use('/api/carrito', routerCarrito);  
  app.use('/', routerLogin);

  // Ruta para documentación SWAGGER
  app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJsDoc(optionsSwagger)))
  
  app.use((req,res) => {
    res.send({status: 'ERROR', result: `Ruta ${req.url} no implementada`})
  });
  
  
  app.listen(PORT, () => console.log(`Server Up on Port ${PORT}!!`));
}