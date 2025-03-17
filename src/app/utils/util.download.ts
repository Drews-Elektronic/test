export class UtilDownload {

  public static base64Toint8Array(base64: string): Uint8Array {
    const byteString = window.atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    return int8Array;
  }

  public static base64ToBlob(base64: string): Blob {
    const int8Array = this.base64Toint8Array(base64)

    const blob = new Blob([int8Array], { type: 'image/png' });    
    return blob;
  }

  public static saveFileFromBlob(filename: string, content: string, type: string){
    const blob = this.base64ToBlob(content);
    
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

}
