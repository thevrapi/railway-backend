const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())
app.use(cors())
app.use((req, res, next) => {
    console.log(`INCOMING ${req.method} in path: ${req.path}`)
    next()
})

const db = {
    users: []
}

const AT_SECRET = "My_only_secret"
const RT_SECRET = "My_only_secret"

app.post("/auth/login", (req, res) => {
    const body = req.body
    if(!body) return res.status(401).json({message: "No login data sent"})
    const foundUser = db.users.find(u => u.username === body.username.toLowerCase())
    if(!foundUser) return res.status(401).json({message: `User "${body.username}" does not exist`})
    console.log(body.password, foundUser.password)
    const result = bcrypt.compareSync(body.password, foundUser.password)
    if(!result) return res.status(401).json({message: `Credentials are incorrect`})
    try {
        const at = jwt.sign({ userId: foundUser.userId }, AT_SECRET, { expiresIn: '1hr' })
        const rt = jwt.sign({ userId: foundUser.userId }, RT_SECRET, { expiresIn: '1hr' })
        res.json({message:"Login successful", accessToken: at, refreshToken: rt, user: {...foundUser, password:undefined}})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({message: "Token failed to generate"})
    }
})

app.post("/auth/register", (req, res) => {
    const body = req.body
    if(!body) return res.status(401).json({message: "No user data sent"})
    const foundUser = db.users.find(u => (u.username === body.username.trim().toLowerCase()) || (u.email === body.email.trim().toLowerCase()))
    if(foundUser) return res.status(409).json({message: `User "${body.username} or ${body.email}" already exist`})
    body.userId = Date.now()
    body.username = body.username.trim().toLowerCase()
    body.email = body.email.trim().toLowerCase()
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(body.password, salt);
    body.password = hash
    db.users.push(body)
    res.json({message:"Registration successful", user: {...body, password:undefined}})
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
const PORT = process.env.PORT || 3000;  // Use 3000 by default if not set
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
    console.log(`Server started successfully on ${HOST}:${PORT}`);
});

