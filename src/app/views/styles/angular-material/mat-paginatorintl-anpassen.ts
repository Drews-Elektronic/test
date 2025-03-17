import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

import { MatPaginatorIntl } from "@angular/material/paginator";

@Injectable()
export class MatPaginatorIntlAnpassen implements MatPaginatorIntl{
  changes = new Subject<void>();

// Aus Angular Material Tutorial entommen

  // For internationalization, the `$localize` function from
  // the `@angular/localize` package can be used.
  /*
  firstPageLabel = $localize`First page`;
  itemsPerPageLabel = $localize`Items per page:`;
  lastPageLabel = $localize`Last page`;
  */
 
  // You can set labels to an arbitrary string too, or dynamically compute
  // it through other third-party internationalization libraries.
  /*
  nextPageLabel = 'Next page';
  previousPageLabel = 'Previous page';
  */


  firstPageLabel = `Erste Seite`;
  itemsPerPageLabel = `Zeilen pro Seite:`;
  lastPageLabel = `Letzte Seite`;

  nextPageLabel = 'Nächste Seite';
  previousPageLabel = 'vorherige Seite';

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return `Seite 1 of 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Seite ${page + 1} von ${amountPages}`;
  }
}
