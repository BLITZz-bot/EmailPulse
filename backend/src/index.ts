import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { env } from './config/env';
import passport from './config/passport';
import emailRoutes from './routes/emailRoutes';
import authRoutes from './routes/authRoutes';
import { startEmailWorker } from './workers/emailWorker';

const app = express();

// Trust proxy for production cloud platforms (Render/Vercel)
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/auth', authRoutes);
app.use('/api/emails', emailRoutes);

// Start BullMQ Worker
startEmailWorker();

// Start Server
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
});
