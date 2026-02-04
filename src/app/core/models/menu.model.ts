// src/app/core/models/menu.model.ts

/**
 * Interface for a single menu item as received from the backend API.
 */
export interface IMenuItem {
  id: number;
  nombre: string;
  ruta: string | null;
  icono: string;
  orden: number;
  children: IMenuItem[] | null;
}
