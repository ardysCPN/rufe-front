import { Component, Input, forwardRef, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ICatalogoItemResponse } from '../../../models/catalogs.model';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() options: ICatalogoItemResponse[] = [];
  @Input() required: boolean = false;
  @Input() loadingOptions: boolean = false;

  value: any = ''; // Inicializar a string vacío para que el placeholder se muestre por defecto.
  disabled: boolean = false;

  // Funciones para propagar cambios al Forms API
  onChange: (value: any) => void = () => { };
  onTouched: () => void = () => {};

  constructor(private _cdr: ChangeDetectorRef) {}

  /**
   * Escribe un nuevo valor desde el modelo a la vista. Mapea `null` a `''` para el placeholder.
   */
  writeValue(value: any): void {
    // Cuando el modelo del formulario es null o undefined (ej. en un reset),
    // se establece el valor interno a un string vacío para que coincida con el placeholder.
    this.value = (value === null || value === undefined) ? '' : value;
    this._cdr.markForCheck();
  }

  /**
   * Registra una función de callback para ser llamada cuando el valor cambie en la UI.
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  /**
   * Registra una función de callback para ser llamada cuando el control sea "tocado".
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /**
   * Se llama cuando el estado de deshabilitado del control cambia.
   */
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this._cdr.markForCheck();
  }

  /**
   * Se llama cuando el usuario selecciona una opción. Propaga el cambio al modelo.
   */
  onSelectionChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const stringValue = selectElement.value;

    // El placeholder tiene un valor de string vacío. Lo mapeamos a `null` para el modelo.
    if (stringValue === '') {
      this.onChange(null);
    } else {
      // Los valores de las opciones son los IDs numéricos. Los convertimos de nuevo a número para mantener la consistencia de tipos.
      const numericValue = parseInt(stringValue, 10);
      this.onChange(numericValue);
    }
    this.onTouched();
  }
}
