// src/app/core/services/backup.service.ts

import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { exportDB, importInto } from 'dexie-export-import';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly encryptionKey = environment.backupEncryptionKey;

  constructor(private db: DatabaseService) {}

  /**
   * Genera una copia de seguridad cifrada de la base de datos local.
   */
  async exportBackup(): Promise<void> {
    await this.db.ensureDbReady();

    try {
      // 1. Exportar la base de datos a un Blob
      const blob = await exportDB(this.db, {
        prettyJson: false,
      });

      // 2. Leer el Blob como texto (JSON)
      const text = await blob.text();

      // 3. Cifrar el texto usando AES-256-CBC
      // CryptoJS por defecto usa CBC y PKCS7 padding.
      // Si solo pasamos el password, genera una sal y deriva la clave (OpenSSL compatible).
      const encrypted = CryptoJS.AES.encrypt(text, this.encryptionKey).toString();

      // 4. Crear un Blob con el contenido cifrado
      const encryptedBlob = new Blob([encrypted], { type: 'application/octet-stream' });

      // 5. Descargar el archivo
      this.downloadFile(encryptedBlob);
    } catch (error) {
      console.error('Error al exportar backup:', error);
      throw error;
    }
  }

  /**
   * Restaura la base de datos desde un archivo cifrado.
   * @param file El archivo .enc proporcionado por el usuario.
   */
  async importBackup(file: File): Promise<void> {
    await this.db.ensureDbReady();

    try {
      // 1. Leer el archivo como texto
      const encryptedText = await file.text();

      // 2. Descifrar el contenido
      const bytes = CryptoJS.AES.decrypt(encryptedText, this.encryptionKey);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        throw new Error('No se pudo descifrar el archivo. Clave incorrecta o archivo corrupto.');
      }

      // 3. Convertir el texto descifrado a Blob para Dexie
      const decryptedBlob = new Blob([decryptedText], { type: 'application/json' });

      // 4. Importar a la base de datos
      await importInto(this.db, decryptedBlob, {
        clearTablesBeforeImport: true,
        overwriteValues: true,
        acceptVersionDiff: true
      });

      console.log('Backup restaurado con éxito.');
    } catch (error) {
      console.error('Error al importar backup:', error);
      throw error;
    }
  }

  private downloadFile(blob: Blob): void {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const filename = `rufe_backup_${timestamp}.enc`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
