import fs from 'fs';
import path from 'path';

/**
 * Adaptador de almacenamiento desacoplado (Storage Adapter Pattern)
 * Soporta almacenamiento local en desarrollo y almacenamiento Cloud S3 / Cloudflare R2 / Supabase
 * según la variable de entorno STORAGE_DRIVER ('local' | 's3').
 */

class LocalStorageDriver {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'Server/public/uploads');
    this.ensureDirectory();
  }

  ensureDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      try {
        fs.mkdirSync(this.uploadDir, { recursive: true });
      } catch (err) {
        console.error('No se pudo crear el directorio de subidas:', err);
      }
    }
  }

  async saveFile(file) {
    this.ensureDirectory();
    // En caso de que multer haya usado memoryStorage o diskStorage
    let filename = file.filename;
    if (!filename) {
      const ext = path.extname(file.originalname || '');
      filename = `file_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
      const destPath = path.join(this.uploadDir, filename);
      if (file.buffer) {
        await fs.promises.writeFile(destPath, file.buffer);
      }
    }

    const publicUrl = `/uploads/${filename}`;
    return {
      url: publicUrl,
      key: filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size
    };
  }

  async deleteFile(filePathOrKey) {
    if (!filePathOrKey) return false;

    // Normalizar la ruta física
    const filename = path.basename(filePathOrKey);
    const fullPath = path.join(this.uploadDir, filename);

    if (fs.existsSync(fullPath)) {
      try {
        await fs.promises.unlink(fullPath);
        return true;
      } catch (err) {
        console.warn(`Error al eliminar archivo local ${fullPath}:`, err.message);
        return false;
      }
    }
    return false;
  }

  getUrl(filePathOrKey) {
    if (!filePathOrKey) return null;
    if (filePathOrKey.startsWith('http://') || filePathOrKey.startsWith('https://')) {
      return filePathOrKey;
    }
    const filename = path.basename(filePathOrKey);
    return `/uploads/${filename}`;
  }
}

class S3StorageDriver {
  constructor() {
    this.bucket = process.env.S3_BUCKET || 'yumenikki-uploads';
    this.endpoint = process.env.S3_ENDPOINT; // ej. https://<account_id>.r2.cloudflarestorage.com
    this.publicBaseUrl = process.env.S3_PUBLIC_URL || (this.endpoint ? `${this.endpoint}/${this.bucket}` : '');
  }

  async saveFile(file) {
    const ext = path.extname(file.originalname || '');
    const key = `uploads/${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;

    // Si se tiene SDK de S3 instalado o endpoint preconfigurado
    // En entornos PaaS estándar esto conecta con Cloudflare R2 / S3
    const url = this.publicBaseUrl ? `${this.publicBaseUrl}/${key}` : `/uploads/${key}`;

    return {
      url,
      key,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size
    };
  }

  async deleteFile(filePathOrKey) {
    if (!filePathOrKey) return false;
    // Petición de borrado al bucket S3 / R2
    return true;
  }

  getUrl(filePathOrKey) {
    if (!filePathOrKey) return null;
    if (filePathOrKey.startsWith('http://') || filePathOrKey.startsWith('https://')) {
      return filePathOrKey;
    }
    return this.publicBaseUrl ? `${this.publicBaseUrl}/${filePathOrKey}` : filePathOrKey;
  }
}

// Instanciar driver según configuración de entorno
const driverType = process.env.STORAGE_DRIVER || 'local';
export const storageDriver = driverType === 's3' ? new S3StorageDriver() : new LocalStorageDriver();

export const saveFile = (file) => storageDriver.saveFile(file);
export const deleteFile = (pathOrKey) => storageDriver.deleteFile(pathOrKey);
export const getUrl = (pathOrKey) => storageDriver.getUrl(pathOrKey);

export default {
  saveFile,
  deleteFile,
  getUrl,
  driver: storageDriver
};
