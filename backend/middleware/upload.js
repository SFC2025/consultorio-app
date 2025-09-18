const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const ok = ["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype);
  if (!ok) return cb(new Error("Formato inválido. Solo JPG/PNG."), false);
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
