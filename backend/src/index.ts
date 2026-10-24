import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`MiniLedger API listening on port ${PORT}`));
