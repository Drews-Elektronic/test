import { Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';



import { MitteilungService } from 'src/app/services/mitteilung.service';

interface CallbackUpload{

}

@Component({
  selector: 'mpl-button-fileupload',
  templateUrl: './button-fileupload.component.html',
  styleUrl: './button-fileupload.component.scss'
})
export class ButtonFileuploadComponent {
  @Input() label: string = "Datei auswählen"
  bitte_warten_label: string = "Bitte warten ..."
  @Input() bitte_warten: boolean = false

  @Output() callback: EventEmitter<any> = new EventEmitter<CallbackUpload>();

  @ViewChild('upload') upload : any

  constructor(
    private mitteilungService: MitteilungService,
  ) { }

  upload_vorbereiten(event: any){
    const files = event.files;

    // Den 'file' Input zurücksetzen
    this.upload.clear()

    // File prüfen
    let file: any;
    if (files && files.length > 0) {
      file = files[0];
    } else {
      file = undefined
    }

    if (!file || file.length == 0) {
      //this.mitteilungService.createMessage("Sie haben keine Datei ausgewählt", "warning")
      this.mitteilungService.createMessageDialog("Sie haben keine Datei ausgewählt")
      return
    }

    // file mit @Output versenden
    this.callback.emit(file)
  }
}
