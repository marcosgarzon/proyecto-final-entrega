const passport = require('passport');
const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs');
const UserModel = require('../models/User.mongo')

const { enviarMail } = require('../utils/enviarMail');

const { logger_info } = require('../logs/log_config');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser( async(id, done) => {
  const user = await UserModel.findById(id);
  done(null, user);
});

passport.use('local-register', new localStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done)=>{
  
    let user = await UserModel.findOne({ email: email});
    if(user) return done(null, false, { message: 'Email ya registrado'});
    
    let hashedPassword = await bcrypt.hash(password, 12);

    user = new UserModel();
    user.email= email;
    user.password = hashedPassword;
    user.nombre = req.body.name;
    user.direccion = req.body.direccion;
    user.edad = req.body.edad;
    user.telefono = req.body.telefono;
    user.foto = req.body.foto;

    await user.save();

    //Envío mail al administrador
    let mensaje = `<div><h2>Nuevo Usuario Registrado</h2><p>Email: ${email}</p><p>Nombre: ${req.body.name}</p><p>Dirección: ${req.body.direccion}</p><p>Teléfono: ${req.body.telefono}</p><p>Edad: ${req.body.edad}</p></div>`;
    enviarMail(process.env.MAIL_NODEMAILER, 'Nuevo Registro', mensaje)

    //Envío mail al usuario que se registró 
    mensaje = `<div><h2>Bienvenido/a</h2><p>Gracias por registrarte en Ecommerce Back, puedes visitar la tienda cuando gustes.</p><a href="#">www.tienda-back.com</a></div>`;
    enviarMail(email, `Ecommerce Back, Bienvenido/a ${req.body.name}`, mensaje)

    logger_info.info(`Ruta ${req.method} - "${req.hostname}:${req.socket.localPort}${req.baseUrl}" accedida - Email: ${user.email} - User: ${user.nombre} registrado.`);  

    done(null, user);  
}))

passport.use('local-login', new localStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, async (req, email, password, done)=>{
  
    let user = await UserModel.findOne({ email: email});
    if(!user) return done(null, false, { message: 'Email no registrado'});
    
    let comparePassword = await bcrypt.compare(password, user.password);
    if(!comparePassword) return done(null, false, { message: 'Password incorrecto'})
    
    logger_info.info(`Ruta ${req.method} - "${req.hostname}:${req.socket.localPort}${req.baseUrl}" accedida - Email: ${user.email} - User: ${user.nombre} logueado.`);  

    done(null, user);  
}))