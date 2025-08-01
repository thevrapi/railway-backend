const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use((req, res, next) => {
    console.log(`INCOMING ${req.method} in path: ${req.path}`)
    next()
})

app.post("/auth/login", (req, res) => {
    const body = req.body
    console.log("BODY:::", body)
    if(!body) return res.status(401).json({message: "No login data sent"})
    res.json({message:"Login successful", accessToken: "ABC", refreshToken: "DEF", user: {userId:777, firstName:"Relando", lastName: "Vrapi", age: 29}})
})

app.get('/auth/status', (req, res) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log("TOKEN:::", token)
    if(!token){
        return res.status(401).json({message: "User not logged in"})
    }

    res.json({message: "Here is user data", user: {userId:777, firstName:"Relando", lastName: "Vrapi", age: 29}})
})

app.listen(3002, () => {
    console.log("Server started successfully on port 3002")
})