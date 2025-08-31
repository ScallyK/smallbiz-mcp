import { SquareClient, SquareEnvironment } from "square";

// Init Square Client
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Sandbox,
});

export default squareClient;