import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RufeRepository } from "../../../../core/repositories/rufe.repository";
import { SyncService } from "../../../../core/services/sync.service";

@Component({
  selector: 'app-sync-pendientes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Registros pendientes de sincronizar</h2>
      <button (click)="syncNow()" class="px-4 py-2 bg-blue-600 text-white rounded-md">Sincronizar ahora</button>

      <h3 class="mt-6 font-semibold">RUFE pendientes</h3>
      <ul>
        <li *ngFor="let r of rufes">{{ r.cliente_id }} - {{ r.estado_sincronizacion }}</li>
      </ul>

      <h3 class="mt-6 font-semibold">Integrantes pendientes</h3>
      <ul>
        <li *ngFor="let i of integrantes">{{ i.cliente_id }} - {{ i.estado_sincronizacion }}</li>
      </ul>
    </div>
  `
})
export class SyncPendientesComponent implements OnInit {
  rufes: any[] = [];
  integrantes: any[] = [];

  constructor(private rufeRepository: RufeRepository, private sync: SyncService) { }

  async ngOnInit() {
    this.rufes = await this.rufeRepository.getPendingSyncRufes();
    this.integrantes = await this.rufeRepository.getPendingSyncIntegrantes();
  }

  async syncNow() {
    await this.sync.syncPending();
    this.rufes = await this.rufeRepository.getPendingSyncRufes();
    this.integrantes = await this.rufeRepository.getPendingSyncIntegrantes();
  }
}
