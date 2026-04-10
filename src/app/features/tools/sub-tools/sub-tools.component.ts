import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BackupService } from '../../../core/services/backup.service';
import { ConfirmModalComponent } from '../../../shared/components/modals/confirm-modal.component';

@Component({
    selector: 'app-sub-tools',
    standalone: true,
    imports: [
      CommonModule, 
      MatCardModule, 
      MatIconModule, 
      MatSnackBarModule, 
      MatDialogModule
    ],
    template: `
    <div class="p-8 animate-fade-in-up">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Herramientas Extra</h1>
        <p class="text-gray-500">Utilidades adicionales del sistema</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <!-- Generar Backup -->
        <button (click)="generateBackup()" class="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border-2 border-transparent hover:border-emerald-500 transition-all text-left group">
           <mat-icon class="text-emerald-500 mb-6 scale-[2] origin-left group-hover:rotate-12 transition-transform">cloud_download</mat-icon>
           <h3 class="font-bold text-2xl mb-3 dark:text-white">Generar Copia</h3>
           <p class="text-gray-400 text-sm leading-relaxed">Descarga un archivo cifrado (.enc) con toda la información local para su respaldo.</p>
        </button>

        <!-- Restaurar Backup -->
        <button (click)="fileInput.click()" class="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border-2 border-transparent hover:border-amber-500 transition-all text-left group">
           <mat-icon class="text-amber-500 mb-6 scale-[2] origin-left group-hover:-rotate-12 transition-transform">cloud_upload</mat-icon>
           <h3 class="font-bold text-2xl mb-3 dark:text-white">Restaurar Copia</h3>
           <p class="text-gray-400 text-sm leading-relaxed">Carga un archivo de respaldo (.enc) para recuperar la información en este dispositivo.</p>
           <input #fileInput type="file" accept=".enc" (change)="onFileSelected($event)" class="hidden">
        </button>
      </div>
    </div>
  `,
})
export class SubToolsComponent {
  constructor(
    private backupService: BackupService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  async generateBackup() {
    try {
      await this.backupService.exportBackup();
      this.showNotification('Backup generado y descargado correctamente', 'check_circle', 'success');
    } catch (error) {
      this.showNotification('Error al generar el backup', 'error', 'error');
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Primer confirmación
    const firstConfirm = await this.dialog.open(ConfirmModalComponent, {
      data: {
        title: '¿Restaurar Copia de Seguridad?',
        message: 'Esta acción reemplazará todos los datos actuales de la base de datos local.',
        confirmText: 'Siguiente',
        icon: 'warning',
        isWarning: true
      }
    }).afterClosed().toPromise();

    if (!firstConfirm) {
      event.target.value = '';
      return;
    }

    // Segunda confirmación (Re-confirmación con advertencia de pérdida)
    const secondConfirm = await this.dialog.open(ConfirmModalComponent, {
      data: {
        title: '¡Advertencia de Seguridad!',
        message: 'Se perderá cualquier información que NO haya sido sincronizada o guardada previamente. ¿Realmente desea continuar?',
        confirmText: 'Hacerlo ahora',
        icon: 'report_problem',
        isWarning: true
      }
    }).afterClosed().toPromise();

    if (secondConfirm) {
      try {
        await this.backupService.importBackup(file);
        this.showNotification('Copia de seguridad restaurada con éxito', 'done_all', 'success');
        
        // Opcional: Recargar para asegurar que los servicios vean los nuevos datos
        setTimeout(() => window.location.reload(), 2000);
      } catch (error) {
        this.showNotification('Error: El archivo no es válido o la clave es incorrecta', 'error_outline', 'error');
      }
    }
    
    event.target.value = ''; // Reset input
  }

  private showNotification(message: string, icon: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: type === 'success' ? ['bg-green-600', 'text-white'] : ['bg-red-600', 'text-white'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
}
