import { SquareClient, SquareEnvironment } from "square";

const token = process.env.SQUARE_ACCESS_TOKEN_DEV;
if (!token) {
  throw new Error("SQUARE_ACCESS_TOKEN_DEV environment variable is not set. Please set it before running the application.");
}

// Init Square Client
const squareClient = new SquareClient({
  token,
  environment: SquareEnvironment.Sandbox,
});

export default squareClient;