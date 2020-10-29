const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());



require("./routes")(app);

const PORT = 3000 || process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server Start on PORT: ${PORT}`);
})