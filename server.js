import express from 'express';
import { APP_PORT, DB_URL } from './config';
import errorHandler from './middlewares/erroHandler';
import router from './routes';
import mongoose from 'mongoose';
import path from 'path';


const app = express();

// mongo db connection
mongoose.connect(DB_URL,);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection.error:'));

db.once('open', () => {
  console.log('db connected...')
});

global.appRoot = path.resolve(__dirname);

app.use(express.urlencoded({ extended: false }));

app.use(express.json())

app.use('/api', router);

app.use(errorHandler);

app.use('/uploads', express.static('uploads'));

app.listen(process.env.PORT || APP_PORT, () => console.log(`Listening on port:  http://localhost:${APP_PORT}`));

module.exports = app;