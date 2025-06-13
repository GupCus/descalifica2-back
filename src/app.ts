import express from 'express'

const app = express();

app.use(express.json())

app.use('/', (req,res)=>{
    res.send("Hello")
})
app.listen(3000,()=>{
    console.log('Corriendo');
})