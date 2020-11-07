const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const cors = require("cors");
app.use(cors());
// const origin = [
//     'http://localhost:8080/'
// ]
// const corsOptions = {
//     origin: "*",
//     credentials: true,
//     maxAge: 1728000
// }

app.use(session({
    secret: "austin",
    name: "austin",
    cookie: { maxAge: 8000000 },
    resave: false,
    saveUninitialized: true
}))


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


require("./routes")(app);
const PORT = 3000 || process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server Start on PORT: ${PORT}`);
})