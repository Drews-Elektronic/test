import { Component, isDevMode } from '@angular/core';
import { filter, take, tap } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { FehlermeldungdialogComponent } from './views/.children/.fehlermeldung/fehlermeldungdialog/fehlermeldungdialog.component';
import { MitteilungService } from './services/mitteilung.service';

@Component({
  selector: 'mpl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  einblenden: boolean = true

  constructor(
    private mitteilung: MitteilungService
  ) {}

  ngOnInit(){
    if(isDevMode()){
      console.log("Development!")
    } else {
      console.log('Production!')
    }
  }
}

