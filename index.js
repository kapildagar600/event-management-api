const express = require('express')
const cors= require('cors')

require('dotenv').config();
const eventRoutes = require('./routes/eventRoutes')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/api/events',eventRoutes);

app.listen(process.env.PORT || 5000,()=>{
    console.log(`server running on ${process.env.PORT}`)
});
