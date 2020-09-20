const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");

const app = express();

require('./config/passport')(passport);

const db = require("./config/keys").MongoURI;

mongoose
  .connect(db, {
    useNewUrlParser: true
  })
  .then(() => console.log("MongoDB connected!!"))
  .catch(err => console.log(err));

//BodyParser

app.use(express.urlencoded({ extended: false }));

// Express-Session

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg =  req.flash('success_msg');
    res.locals.error_msg =  req.flash('error_msg');
    res.locals.error =  req.flash('error');
    next();
})

app.use(expressLayouts);
app.set("view engine", "ejs");

// Routes
app.use("/", require("./routes/index"));
app.use("/users", require("./routes/user"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server @ PORT:${PORT}`));
