import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./src/config.js";

const payload = { id: 0, rol_id: 1, email: "system@local" }; // admin
const token = jwt.sign(payload, JWT_SECRET, { noTimestamp: true }); // estable, sin exp

console.log("\nTOKEN_ESTATICO generado:\n");
console.log(token);
console.log("\nPega este valor en tu .env como TOKEN_ESTATICO=\n");
