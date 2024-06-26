require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define a schema and model for the form data
const formSchema = new mongoose.Schema({
    name: String,
    email: String,
    service: String,
    phoneNumber: String
});

const Form = mongoose.model('Form', formSchema);

// Routes

// Route to submit form data
app.post('/submit', async (req, res) => {
    const formData = new Form(req.body);
    try {
        await formData.save();
        res.status(200).send('Form data saved successfully');
    } catch (error) {
        res.status(500).send('Error saving form data');
    }
});

// Route to get all form data
app.get('/forms', async (req, res) => {
    try {
        const forms = await Form.find();
        res.status(200).json(forms);
    } catch (error) {
        res.status(500).send('Error retrieving form data');
    }
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../client/build')));

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../client/build/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
