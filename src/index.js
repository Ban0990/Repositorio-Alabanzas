import app from "./app.js";
import { PORT } from "./config.js";
import { probarConexion } from "./db.js";

(async () => {
  try {
    await probarConexion();
  } catch (e) {
    console.error("⚠️ La API arrancará aunque la DB falle (revisa ENV en Render).");
  }

  app.listen(PORT, () => {
    console.log(`🚀 API corriendo en puerto ${PORT}`);
  });
})();
