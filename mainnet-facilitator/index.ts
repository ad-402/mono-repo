/* eslint-env node */
import { config } from "dotenv";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { verify, settle } from "x402/facilitator";
import {
  PaymentRequirementsSchema,
  type PaymentRequirements,
  type PaymentPayload,
  PaymentPayloadSchema,
  createConnectedClient,
  createSigner,
  SupportedEVMNetworks,
  SupportedSVMNetworks,
  Signer,
  ConnectedClient,
  SupportedPaymentKind,
  // isSvmSignerWallet,
} from "x402/types";

config();

const EVM_PRIVATE_KEY = process.env.EVM_PRIVATE_KEY || "";
const SVM_PRIVATE_KEY = process.env.SVM_PRIVATE_KEY || "";

if (!EVM_PRIVATE_KEY && !SVM_PRIVATE_KEY) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const app = express();

// Allowed origins for CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://ad402.io",
      "https://www.ad402.io",
      "https://ad402.vercel.app",
    ];

// Configure CORS with proper origin checking
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Allow localhost in development
      if (
        process.env.NODE_ENV === "development" &&
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      // Check whitelist
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      // Log and reject
      console.warn(`CORS: Blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  }),
);

// Configure express to parse JSON bodies
app.use(express.json());

type VerifyRequest = {
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
};

type SettleRequest = {
  paymentPayload: PaymentPayload;
  paymentRequirements: PaymentRequirements;
};

app.get("/", (req: Request, res: Response) => {
  res.json({
    name: "x402 Facilitator Server",
    version: "1.0.0",
    endpoints: {
      verify: "/verify",
      settle: "/settle",
      supported: "/supported",
    },
    status: "running",
  });
});

app.get("/verify", (req: Request, res: Response) => {
  res.json({
    endpoint: "/verify",
    description: "POST to verify x402 payments",
    body: {
      paymentPayload: "PaymentPayload",
      paymentRequirements: "PaymentRequirements",
    },
  });
});

app.post("/verify", async (req: Request, res: Response) => {
  try {
    console.log("Verify request received:", JSON.stringify(req.body, null, 2));

    const body: VerifyRequest = req.body;
    const paymentRequirements = PaymentRequirementsSchema.parse(
      body.paymentRequirements,
    );
    const paymentPayload = PaymentPayloadSchema.parse(body.paymentPayload);

    console.log("Parsed paymentRequirements:", paymentRequirements);
    console.log("Parsed paymentPayload:", paymentPayload);

    // use the correct client/signer based on the requested network
    // svm verify requires a Signer because it signs & simulates the txn
    let client: Signer | ConnectedClient;
    if (SupportedEVMNetworks.includes(paymentRequirements.network)) {
      client = createConnectedClient(paymentRequirements.network);
    } else if (SupportedSVMNetworks.includes(paymentRequirements.network)) {
      client = await createSigner(paymentRequirements.network, SVM_PRIVATE_KEY);
    } else {
      throw new Error(`Invalid network: ${paymentRequirements.network}`);
    }

    // verify
    const valid = await verify(client, paymentPayload, paymentRequirements);
    console.log("Verification result:", valid);
    res.json(valid);
  } catch (error) {
    console.error("Verification error:", error);
    res.status(400).json({ error: `Verification failed: ${error}` });
  }
});

app.get("/settle", (req: Request, res: Response) => {
  res.json({
    endpoint: "/settle",
    description: "POST to settle x402 payments",
    body: {
      paymentPayload: "PaymentPayload",
      paymentRequirements: "PaymentRequirements",
    },
  });
});

app.get("/supported", async (req: Request, res: Response) => {
  try {
    let kinds: SupportedPaymentKind[] = [];

    // evm
    if (EVM_PRIVATE_KEY) {
      kinds.push({
        x402Version: 1,
        scheme: "exact",
        network: "polygon-amoy",
      });
      kinds.push({
        x402Version: 1,
        scheme: "exact",
        network: "polygon",
      });
    }

    // // svm - commented out as requested
    // if (SVM_PRIVATE_KEY) {
    //   const signer = await createSigner("solana-devnet", SVM_PRIVATE_KEY);
    //   const feePayer = isSvmSignerWallet(signer) ? signer.address : undefined;

    //   kinds.push({
    //     x402Version: 1,
    //     scheme: "exact",
    //     network: "solana-devnet",
    //     extra: {
    //       feePayer,
    //     },
    //   });
    // }

    console.log("Supported payment kinds:", kinds);
    res.json({
      kinds,
    });
  } catch (error) {
    console.error("Error getting supported kinds:", error);
    res.status(500).json({ error: "Failed to get supported payment kinds" });
  }
});

app.post("/settle", async (req: Request, res: Response) => {
  try {
    console.log("Settle request received:", JSON.stringify(req.body, null, 2));
    const body: SettleRequest = req.body;
    const paymentRequirements = PaymentRequirementsSchema.parse(
      body.paymentRequirements,
    );
    const paymentPayload = PaymentPayloadSchema.parse(body.paymentPayload);

    console.log("Parsed paymentRequirements:", paymentRequirements);
    console.log("Parsed paymentPayload:", paymentPayload);

    // use the correct private key based on the requested network
    let signer: Signer;
    if (SupportedEVMNetworks.includes(paymentRequirements.network)) {
      console.log(
        "Creating EVM signer for network:",
        paymentRequirements.network,
      );
      signer = await createSigner(paymentRequirements.network, EVM_PRIVATE_KEY);
    } else if (SupportedSVMNetworks.includes(paymentRequirements.network)) {
      console.log(
        `Creating SVM signer for network: ${paymentRequirements.network}`,
      );
      signer = await createSigner(paymentRequirements.network, SVM_PRIVATE_KEY);
    } else {
      throw new Error(`Invalid network: ${paymentRequirements.network}`);
    }

    console.log("Signer created, attempting to settle...");

    // settle
    const response = await settle(signer, paymentPayload, paymentRequirements);
    console.log("Settlement result:", response);

    res.json(response);
  } catch (error) {
    console.error("Settlement error:", error);
    res.status(400).json({ error: `Settlement failed: ${error}` });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: {
      hasEvmKey: !!EVM_PRIVATE_KEY,
      hasSvmKey: !!SVM_PRIVATE_KEY,
      nodeEnv: process.env.NODE_ENV || "development",
    },
  });
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, _: unknown) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not found",
    path: req.path,
    method: req.method,
    availableEndpoints: ["/", "/verify", "/settle", "/supported", "/health"],
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 x402 Facilitator Server running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Supported networks: http://localhost:${PORT}/supported`);
  console.log(`🌍 CORS: Disabled (allows all origins)`);
  console.log(
    `🔑 EVM Private Key: ${EVM_PRIVATE_KEY ? "✅ Configured" : "❌ Missing"}`,
  );
  console.log(
    `🔑 SVM Private Key: ${SVM_PRIVATE_KEY ? "✅ Configured" : "❌ Missing"}`,
  );
});
