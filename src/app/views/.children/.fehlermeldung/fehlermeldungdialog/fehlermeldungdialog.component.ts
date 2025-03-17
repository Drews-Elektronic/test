import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'mpl-fehlermeldungdialog',
  templateUrl: './fehlermeldungdialog.component.html',
  styleUrl: './fehlermeldungdialog.component.scss'
})
export class FehlermeldungdialogComponent {
  title: string|undefined;
  content: {message:string, todo?: string};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {title?: string, content: {message:string, todo?: string} | string},
  ){
    this.title = data.title

    const content = data.content

    let tmp_data;
    if(typeof content === "string"){
      tmp_data = { message: content} 
    }else{
      tmp_data = { 
        message: content.message,
        todo: content?.todo
      }
    }

    this.content = tmp_data
  }

  ngOnInit(){
    
  }
}
