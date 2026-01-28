export default function errorMiddleware(err, req, res, next) {
  console.error("❌ Error:", err);

  const status = err.statusCode || err.status || 500;
  const message = err.message || "Error interno";

  return res.status(status).json({
    ok: false,
    error: message,
  });
}
