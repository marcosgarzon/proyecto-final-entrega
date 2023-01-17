
const { Router } = require('express');
const router = Router();
const passport = require('passport');

const { logger_info } = require('../logs/log_config');
const CartController = require('../controllers/cart.controller.mongo')

////////////// Middlewares //////////////
const { isLogged, isNotLogged } = require('../middlewares/validaciones')

router.get('/', isLogged, async (req, res) =>{

  let response = await CartController.getMyCart(req.user);  

  let cantidad = 0;
  if(response.result.length !== 0){
    cantidad = response.result[0].length;
  }
  let result = response.result[0];  

  res.render('home.ejs', {user: req.user, result, cantidad});
});

router.get('/register', isNotLogged, (req, res) =>{
  res.render('register.ejs');
});

router.post('/register', passport.authenticate('local-register', {
  successRedirect: '/login',
  failureRedirect: '/register',
  failureFlash: true
}));

router.get('/login', isNotLogged, (req, res) =>{
  res.render('login.ejs');
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/logout', (req, res, next) => {

  logger_info.info(`Ruta ${req.method} - "${req.hostname}:${req.socket.localPort}${req.baseUrl}" accedida - Email: ${req.user.email} - User: ${req.user.nombre} cerró sesión.`);  

  req.logout(function(err) {
    if (err) { 
      return next(err); 
    }        
    res.redirect('/login');
  });
  
});
  
module.exports = router;