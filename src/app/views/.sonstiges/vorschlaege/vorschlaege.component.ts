import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from 'src/app/services/backend.service';

import { MitteilungService } from 'src/app/services/mitteilung.service';

import { getTrigger } from 'src/app/services/table.service'

export interface AngepassterBauteil { // Angular Material Table kann keine verschachtelten Objekte erkennen.  
  bezeichnung: string;
  beschreibung: string;
  mpn: string;
  hersteller: string;
}

@Component({
  selector: 'mpl-vorschlaege',
  templateUrl: './vorschlaege.component.html',
  styleUrls: ['./vorschlaege.component.scss'],
  animations: getTrigger
})
export class VorschlaegeComponent {
  
  constructor(
    private backend: BackendService,
    private router: Router,
    private mitteilungService: MitteilungService
  ) {}

  ngOnInit(): void {
    
  }

  ngOnDestroy(): void {
    this.mitteilungService.closeMessage();
  }

}
