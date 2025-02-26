import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataTransferService {
  private _data: unknown = null;

  constructor() {}

  set Data(value: unknown) {
    this._data = value;
  }
  get Data(): unknown {
    return this._data;
  }

  DeleteData(): void {
    this._data = null;
  }
}
