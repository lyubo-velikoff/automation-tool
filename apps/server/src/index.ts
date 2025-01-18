import 'reflect-metadata';
import express, { Request, Response } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import session from 'express-session';
import { HealthResolver } from './resolvers/health.resolver';

async function bootstrap() {
  const app = express();

  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));

  app.use(session({
    name: 'qid',
    secret: process.env.SESSION_SECRET || 'development_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
  }));

  // REST endpoints
  app.get('/health', (_: Request, res: Response) => {
    res.json({ status: 'OK' });
  });

  // GraphQL setup
  const schema = await buildSchema({
    resolvers: [HealthResolver],
    validate: false,
  });

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: { req: Request; res: Response }) => ({ req, res })
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
    console.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
    console.log(`REST endpoints:`);
    console.log(`  - Health check: http://localhost:${port}/health`);
  });
}

bootstrap().catch(console.error); 
