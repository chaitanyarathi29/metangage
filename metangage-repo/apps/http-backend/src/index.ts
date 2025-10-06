import express from 'express';
import { router } from './routes/v1/index.js';

const app = express();

app.use('/api/v1', router);

app.use(express.json());

app.listen(process.env.HTTP_PORT || 4000, () => {
    console.log('port started at 4000');
});