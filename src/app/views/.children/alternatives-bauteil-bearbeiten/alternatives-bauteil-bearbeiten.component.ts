import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface buttons {
  name: string,
  style: string,
  return: any
}

@Component({
  selector: 'mpl-alternatives-bauteil-bearbeiten',
  templateUrl: './alternatives-bauteil-bearbeiten.component.html',
  styleUrl: './alternatives-bauteil-bearbeiten.component.scss'
})
export class AlternativesBauteilBearbeitenComponent {
  buttons: buttons[]
  
  constructor(
    public dialogRef: MatDialogRef<AlternativesBauteilBearbeitenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any | {buttons: buttons[]}
  ) {
    this.buttons = data.buttons
  }

  abbrechen(): void {
    this.dialogRef.close();
  }
}