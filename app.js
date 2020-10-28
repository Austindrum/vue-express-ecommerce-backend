const express = require("express");
const app = express();


app.get('/', (req, res)=>{
    res.send("<h1>Hello World</h1>");
})

const PORT = 3000 || process.env.PORT;
app.listen(PORT, ()=>{
    console.log(`Server Start on PORT: ${PORT}`);
})