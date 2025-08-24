// src/app/core/models/menu.model.ts

/**
 * Interface for a single menu item as received from the backend API.
 */
export interface IMenuItem {
  id: number;
  parentId: number | null;
  nombreItem: string;
  ruta: string | null; // Null if it's a parent item without a direct route (e.g., "Administración")
  icono: string; // Material Icon name (e.g., "dashboard", "group")
  orden: number;
  subItems: IMenuItem[] | null; // Null if no sub-items, or an array of IMenuItem for children
}
