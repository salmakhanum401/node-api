const axios = require("axios");
const express = require("express");


const app = express();
app.use(express.json());

const url = "http://localhost:8000"

app.get("/products",(req,res)=>{
      axios.get(`${url}/products`)
            .then((response) => {
                console.log(response)
                res.status(200).json(response.data)
            })
            .catch((err) => {
                res.status(500).json(err)
            });
})


const PORT = 4000;

app.listen(PORT,()=>console.log("Server is Running"));


