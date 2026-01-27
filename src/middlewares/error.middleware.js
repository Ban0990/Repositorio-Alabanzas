export default function errorMiddleware(err, req, res, next) {
  console.error("❌ Error:", err);
  res.status(500).json({ ok: false, error: "Error interno" });
}
