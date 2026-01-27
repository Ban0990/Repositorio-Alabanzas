import app from "./app.js";
import { PORT } from "./config.js";
import { probarConexion } from "./db.js";

(async () => {
  await probarConexion();

  app.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`);
  });
})();
