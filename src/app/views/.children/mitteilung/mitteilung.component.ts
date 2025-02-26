// https://ng-bootstrap.github.io/#/components/alert/examples

import { Component, Inject, OnInit, inject } from '@angular/core';

import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'mpl-mitteilung',
  templateUrl: './mitteilung.component.html',
  styleUrls: ['./mitteilung.component.scss']
})
export class MitteilungComponent implements OnInit {  

  snackBarRef = inject(MatSnackBarRef);

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any){}

	ngOnInit(): void {}

  
}
