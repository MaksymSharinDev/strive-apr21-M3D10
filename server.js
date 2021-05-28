const express = require('express')
const { xss } = require('express-xss-sanitizer');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 80
app.listen(port, () => console.log('We are live on ' + port) )
app.use(express.static('public'));
app.use(express.json({ limit: '2MB' }))
app.use(xss());

require('./app/routes')(app, {})
