const express = require('express')
const app = express()
const port = 3000
const cookieParser = require('cookie-parser')
app.set('view engine','ejs')
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

isAuth = (req,res,next) => {
    if(req.cookies && req.cookies.user) {
        return next();
    }
    res.redirect("/login")
}
app.get('/login', (req, res) => {
  res.render('login')
})


isAdmin = (req,res,next) => {
    if(req.cookies && req.cookies.user) {
        return  next();
    }
    res.redirect("/login")
}
app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login',(req,res) => {
    const { user,password } = req.body;
    if(user === "Samu" && password === "6666" ){
        console.log("Usuario correcto")
    res.cookie("user", user) // options js no secure si
    res.redirect('home')
    }  else {
    res.status(401).redirect("login");
}
    
})
app.get('/home', isAuth, (req, res) => {
    res.send("Bienvenido a la página principal");
});
app.get('/logout',  (req, res) => {
    res.clearCookie("user");
    res.render('home');
});


app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})