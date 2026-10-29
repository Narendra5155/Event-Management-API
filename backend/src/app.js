import express from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/error.js';
import { originCheck } from './middlewares/originCheck.js';

const app = express();

app.set('trust proxy', env.trustProxy);
app.disable('x-powered-by');

app.use(helmet());


app.use(cors({ origin: env.clientUrls, credentials: true }));
app.use(originCheck);
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
if (env.nodeEnv === 'development') app.use(morgan('dev'));

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
