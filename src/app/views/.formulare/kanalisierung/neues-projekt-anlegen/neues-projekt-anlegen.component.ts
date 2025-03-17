import { Component } from '@angular/core';
import { filter, take, tap } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { MitteilungService } from 'src/app/services/mitteilung.service';

import { NeuesProjektDialogComponent } from './neues-projekt-dialog/neues-projekt-dialog.component';

@Component({
  selector: 'mpl-neues-projekt-anlegen',
  templateUrl: './neues-projekt-anlegen.component.html',
  styleUrl: './neues-projekt-anlegen.component.scss'
})
export class NeuesProjektAnlegenComponent {
  constructor(
    private dialog: MatDialog,
    private mitteilungService: MitteilungService,
  ) {}

  ngOnInit(){
    const dialogRef = this.dialog.open(NeuesProjektDialogComponent, {
      disableClose: true
    });
    
    let subscribe1 = dialogRef.afterClosed().pipe(
      take(1),
      filter((result: any) => result != undefined),   // Abbrechen
      tap((result: any) => {                          // ja: true; nein: false;
        subscribe1.unsubscribe();
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }
}
