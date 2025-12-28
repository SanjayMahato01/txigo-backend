import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

// Default configuration
const DEFAULT_CONFIG = {
  subfolder: "common",
  maxCount: 5,
  fieldName: "images",
  fileSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/png", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
  maxFieldSizeMB: 20
};

// Extension groups for different file types
const EXTENSION_GROUPS = {
  IMAGES: [".jpg", ".jpeg", ".png", ".webp"],
  VIDEOS: [".mp4", ".mkv", ".webm", ".mov", ".qt"],
  DOCUMENTS: [".pdf", ".doc", ".docx"]
};

const createUploader = (options = {}) => {
  const config = {
    ...DEFAULT_CONFIG,
    ...options,
    // Use provided extensions or default to image extensions
    allowedExtensions: options.allowedExtensions || EXTENSION_GROUPS.IMAGES
  };

  // Validate configuration
  if (config.fileSizeMB > 50) {
    throw new Error("Maximum fileSizeMB is 50");
  }
  if (config.maxCount > 20) {
    throw new Error("Maximum file count is 20");
  }

  const uploadDir = `uploads/${config.subfolder}`;

  // Create directory if not exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${uuidv4()}${ext}`;
      cb(null, uniqueName);
    }
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // Check MIME type and extension
    if (
      config.allowedTypes.includes(file.mimetype) &&
      config.allowedExtensions.includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Only ${config.allowedTypes.join(
            ", "
          )} with extensions ${config.allowedExtensions.join(", ")} allowed`
        ),
        false
      );
    }
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.fileSizeMB * 1024 * 1024, // File size limit
      files: config.maxCount, // Max number of files
      fieldSize: config.maxFieldSizeMB * 1024 * 1024, // For non-file fields
      fieldNameSize: 200 // Max field name size
    }
  }).array(config.fieldName, config.maxCount);

  // Return middleware with better error handling
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // Handle specific Multer errors
          switch (err.code) {
            case "LIMIT_FILE_SIZE":
              return res.status(413).json({ error: "File too large" });
            case "LIMIT_FILE_COUNT":
              return res.status(413).json({ error: "Too many files" });
            case "LIMIT_FIELD_KEY":
              return res.status(413).json({ error: "Field name too long" });
            case "LIMIT_FIELD_VALUE":
              return res.status(413).json({ error: "Field value too long" });
            default:
              return res.status(400).json({ error: err.message });
          }
        }
        // Handle other errors
        return next(err);
      }
      next();
    });
  };
};

// Generate file URL
export const getFileUrl = (req, filename, subfolder) => {
  return `${req.protocol}://${req.get("host")}/uploads/${subfolder}/${filename}`;
};

// Process uploaded files
export const processFiles = (req, subfolder) => {
  if (!req.files || req.files.length === 0) return [];

  return req.files.map((file) => ({
    originalName: file.originalname,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    url: getFileUrl(req, file.filename, subfolder),
    path: file.path,
    // Get caption from request body if available
    caption: req.body[`caption_${file.fieldname}`] || ""
  }));
};

// Cleanup uploaded files on error
export const cleanFilesOnError = (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  const cleanup = () => {
    req.files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Error cleaning file ${file.path}:`, err);
      });
    });
  };

  // Cleanup if response status is 4xx or 5xx
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      cleanup();
    }
  });

  // Also cleanup on request close/error
  req.on("close", cleanup);
  req.on("error", cleanup);

  next();
};

// Pre-configured uploaders
export const blogImageUploader = createUploader({
  subfolder: "blog-images",
  maxCount: 10,
  fileSizeMB: 10,
  fieldName: "blogImages"
});

export const profileImageUploader = createUploader({
  subfolder: "profile-images",
  maxCount: 1,
  fieldName: "avatar",
  fileSizeMB: 2
});

export const documentUploader = createUploader({
  subfolder: "documents",
  maxCount: 5,
  fileSizeMB: 5,
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ],
  allowedExtensions: EXTENSION_GROUPS.DOCUMENTS,
  maxFieldSizeMB: 10
});

export const videoUploader = createUploader({
  subfolder: "web-stories",
  maxCount: 10,
  fieldName: "videos",
  fileSizeMB: 50,
  allowedTypes: ["video/mp4", "video/mkv", "video/webm", "video/quicktime"],
  allowedExtensions: EXTENSION_GROUPS.VIDEOS
});

// Add this to your existing uploader configurations
export const vehicleImageUploader = createUploader({
  subfolder: "drivers",
  maxCount: 4, // RC front/back + car front/back
  fieldName: "vehicleImages",
  fileSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/png"],
  allowedExtensions: [".jpg", ".jpeg", ".png"]
});

export const documentImageUploader = createUploader({
  subfolder: "drivers",
  maxCount: 6, // DL front/back + Aadhar front/back + PAN front/back
  fieldName: "documentImages", // Changed from vehicleImages to documentImages
  fileSizeMB: 5,
  allowedTypes: ["image/jpeg", "image/png"],
  allowedExtensions: [".jpg", ".jpeg", ".png"]
});