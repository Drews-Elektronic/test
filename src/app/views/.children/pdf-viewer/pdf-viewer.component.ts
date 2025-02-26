import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PdfSidebarView, ScrollModeType } from 'ngx-extended-pdf-viewer';
import { BackendService } from 'src/app/services/backend.service';

@Component({
  selector: 'mpl-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.scss'
})
export class PdfViewerComponent {
  aunr: number | string;
  heute: Date

  pdf?: Blob;

  ngOnInit(){
    this.AngebotPdfAnzeigen()
  }

  constructor(
    private backend: BackendService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialogRef: MatDialogRef<PdfViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { aunr: number | string, heute: Date }
  ) {
    this.aunr = data.aunr
    this.heute = data.heute
  }

  //#region PDF
  AngebotPdfAnzeigen() {
    let subscription = this.backend.AngebotPdfAnzeigen(
      this.aunr
    ).subscribe((value: any) => {
      subscription.unsubscribe();

      if(value !== false){
        this.pdf = value
      }
    });
  }
  //#endregion
  //#region


  abbrechen(): void {
    this.dialogRef.close();
  }
  //#endregion
}
