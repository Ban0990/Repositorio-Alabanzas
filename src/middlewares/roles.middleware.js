export const requireRole = (rolesPermitidos = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "No autenticado" });
    }

    const rolId = req.user.rol_id;

    if (!rolesPermitidos.includes(rolId)) {
      return res.status(403).json({ ok: false, error: "No autorizado" });
    }

    return next();
  };
};
