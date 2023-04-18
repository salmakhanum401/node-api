const axios = require("axios");
const { response } = require("express");
const express = require("express");


const app = express();
app.use(express.json());

const url = "http://localhost:8000"
let userId = "63be8e89c64829b30d561c07"


app.get("/cart",(req,res)=>{
        axios.get(`${url}/cart/${userId}`)
            .then((response) => {
                let data = response.data.data;
                console.log(data)
                data = data.map((item)=>{
                    return axios.get(`${url}/products/${item.product}`)
                        
                })
                Promise.all(data)
                .then((response)=>{
                    res.status(200).json(response.map(item=>item.data.data))
                })
                .catch((err) => {
                    res.status(500).json(err)
                });
                console.log(data)
                
                
            })
            .catch((err) => {
                res.status(500).json(err)
            });
})


const PORT = 4000;

app.listen(PORT,()=>console.log("Server is Running"));


