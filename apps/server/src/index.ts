import "reflect-metadata";
import "dotenv/config";
import express, { Request, Response } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import session from "express-session";
import { HealthResolver } from "./resolvers/health.resolver";
import { WorkflowResolver } from "./resolvers/workflow.resolver";
import { ScrapingResolver } from "./resolvers/scraping.resolver";
import { runWorker } from './temporal/worker';
import { supabase } from './lib/supabase';
import { ScrapingService } from './services/scraping.service';
import { json } from 'body-parser';

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error(
    "Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
  );
}

async function bootstrap() {
  const app = express();

  app.use(cors());
  app.use(json());

  app.use(
    session({
      name: "qid",
      secret: process.env.SESSION_SECRET || "development_secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      }
    })
  );

  // REST endpoints
  app.get("/health", (_: Request, res: Response) => {
    res.json({ status: "OK" });
  });

  // REST endpoint for workflows
  app.post("/api/workflows", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Missing or invalid authorization header" });
      }

      const token = authHeader.split(" ")[1];

      // Check if it's the service role key
      if (token === process.env.SUPABASE_SERVICE_KEY) {
        // For service role requests, we trust the user_id in the body
        const { name, nodes, edges, user_id } = req.body;
        if (!user_id) {
          return res.status(400).json({ error: "user_id is required for service role requests" });
        }

        try {
          const workflowResolver = new WorkflowResolver();
          const workflow = await workflowResolver.saveWorkflow(
            user_id,
            name,
            nodes,
            edges
          );
          return res.json(workflow);
        } catch (error: any) {
          return res.status(500).json({ error: error.message || "Failed to save workflow" });
        }
      }

      // Regular user authentication
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser(token);

      if (authError) {
        return res.status(401).json({ error: "Unauthorized: " + authError.message });
      }

      if (!user) {
        return res.status(401).json({ error: "Unauthorized: No user found" });
      }

      const { name, nodes, edges } = req.body;

      try {
        const workflowResolver = new WorkflowResolver();
        const workflow = await workflowResolver.saveWorkflow(
          user.id,
          name,
          nodes,
          edges
        );
        return res.json(workflow);
      } catch (error: any) {
        return res.status(500).json({ error: error.message || "Failed to save workflow" });
      }
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Add test-selector endpoint
  app.post('/api/test-selector', async (req, res) => {
    try {
      console.log('Received test-selector request:', req.body);
      const { url, selector } = req.body;
      
      if (!url || !selector) {
        return res.status(400).json({ 
          success: false, 
          error: 'URL and selector are required' 
        });
      }

      try {
        const scrapingService = new ScrapingService();
        console.log('Created scraping service, starting scrape...');
        const results = await scrapingService.scrapeWithSelector(url, selector);
        console.log('Scraping complete:', results);
        
        res.json({ 
          success: true, 
          results,
          count: results.length
        });
      } catch (error) {
        console.error('Error in scraping service:', error);
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Error occurred during scraping'
        });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(400).json({ 
        success: false, 
        error: 'Invalid request format'
      });
    }
  });

  // GraphQL setup
  const schema = await buildSchema({
    resolvers: [HealthResolver, WorkflowResolver, ScrapingResolver],
    validate: false,
    authChecker: async ({ context }) => {
      try {
        const authHeader = context.req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
          return false;
        }

        const token = authHeader.split(" ")[1];
        const {
          data: { user },
          error
        } = await supabase.auth.getUser(token);

        if (error || !user) {
          return false;
        }

        // Add the user to the context for use in resolvers
        context.user = user;
        return true;
      } catch {
        return false;
      }
    }
  });

  const apolloServer = new ApolloServer({
    schema,
    context: async ({ req, res }: { req: Request; res: Response }) => {
      const context: any = { req, res };

      try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
          const token = authHeader.split(" ")[1];
          const { data: { user }, error } = await supabase.auth.getUser(token);
          
          if (!error && user) {
            context.user = user;
            context.supabase = supabase;
          }
        }
      } catch (error) {
        console.error('Error setting up context:', error);
      }

      return context;
    }
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ 
    app, 
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-gmail-token']
    }
  });

  // Start Temporal worker
  runWorker().catch((err) => {
    console.error('Error starting Temporal worker:', err);
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
    console.log(`GraphQL endpoint: http://localhost:${port}/graphql`);
    console.log(`REST endpoints:`);
    console.log(`  - Health check: http://localhost:${port}/health`);
  });
}

bootstrap().catch(console.error);
