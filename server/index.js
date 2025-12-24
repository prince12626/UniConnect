import "dotenv/config";
import { httpServer } from "./src/app.js";
import connectDB from "./src/config/db.config.js";
import "./src/socket/index.socket.js"

const PORT = process.env.PORT || 5000;

connectDB();
httpServer.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
