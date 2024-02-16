import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const fieldname = file.fieldname.toLowerCase();
    let folder;

    if (fieldname.includes("profile")) {
      folder = "profiles";
    } else if (fieldname.includes("product")) {
      folder = "products";
    } else {
      folder = "documents";
    }

    const uploadPath = `./uploads/${folder}`;
    if (!fs.existsSync(uploadPath)) {
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
      } catch (error) {
        console.error("Error al crear el directorio:", error);
        return cb("Error al crear el directorio");
      }
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

export const upload = multer({ storage });
