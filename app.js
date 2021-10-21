const express = require("express");
const mongoose = require("mongoose");
const Grid = require('gridfs-stream');
const cors = require('cors');

const Job = require('./models/createModel');
const authRoute = require('./routes/auth');
const createRoute = require('./routes/create');
const config = require('./config');
// initialize the app.........
const app = express();

// mongoose connection....
let gfs;
const dbConnect = mongoose.connect(config.MONGOdb_ACCESS, { useNewUrlParser: true,
    useUnifiedTopology: true });
//     .then((conn) => {
//         conn.
//         console.log("connected to mongoDb");

//     }).catch(() => console.log("connection failed")
// );

const conn = mongoose.connection;
dbConnect.once('open', () => {
    gfs = Grid(dbConnect.db, mongoose.mongo);
    gfs.collection("photos");
});

// Middleware.........
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/userProfil/:filename', async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        console.log("Not found");
        console.log(error);
    }
});

app.get('/', async (req, res) => {
    await Job.find().then(user => {
        res.json(user);
    }).catch(err => res.json({ error: err }));
});

app.use('/api/job', createRoute);
app.use("/api/user", authRoute);

app.listen(config.PORT || 8000, () => console.log("Server runing up"));