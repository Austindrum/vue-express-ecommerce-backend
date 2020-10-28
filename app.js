const express = require("express");
const app = express();






require("./routes")(app);

const PORT = 3000 || process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server Start on PORT: ${PORT}`);
})