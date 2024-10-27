import { Injectable } from '@angular/core';
import {Camera, CameraPhoto, CameraResultType,CameraSource,Photo} from '@capacitor/camera';
import {Filesystem, Directory} from '@capacitor/filesystem';
// import {Storage} from '@capacitor/storage';
import { Preferences } from '@capacitor/preferences';
import{ Foto } from'./../../models/foto.interface';



@Injectable({
  providedIn: 'root'
})
export class FotoService {
  public fotos: Foto[]=[];
  private PHOTO_STORAGE: string = "fotos";

  constructor() { }

  public async addNewToGallery(){
    const fotoCapturada = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality:100
    })
    // this.fotos.unshift({
    //   filepath:"foto_",
    //   webviewPath: fotoCapturada.webPath
    // })
    const saveImageFile = await this.savePicture(fotoCapturada);
    this.fotos.unshift(saveImageFile);
    // Storage.set({
    //   key:this.PHOTO_STORAGE,
    //   value: JSON.stringify(this.fotos)
    // });
  }


  public async savePicture (cameraPhoto: CameraPhoto){

    const base64Data = await this.readAsBase64(cameraPhoto);
    const fileName = new Date().getTime + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path:fileName,
      data: base64Data,
      directory: Directory.Data
    });
    return{
      filepath:fileName,
      webviewPath: cameraPhoto.webPath
    }
  }

  public async readAsBase64 (cameraPhoto: CameraPhoto){
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
  }

  convertBlobToBase64 = (blob:Blob) => new Promise ((resolve, reject) => {
    const reader= new FileReader;
    reader.onerror= reject;
    reader.onload=()=>{
      resolve(reader.result)
    }
    reader.readAsDataURL(blob)
  })

//   public async loadSaved(){
//     const listaFotos = await Storage.get({ key: this.PHOTO_STORAGE });
//     this.fotos = listaFotos.value ? JSON.parse(listaFotos.value) : [];
// for (let foto of this.fotos) {
//   const readFile = await Filesystem.readFile({
//     path: foto.filepath,
//     directory: Directory.Data
//   });
//   foto.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
// }

//   }


  public async guardarFoto(): Promise<File | null> {
    try {
      const fotoCapturada = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100
      });

      const photoFile = await this.convertToFile(fotoCapturada);
      return photoFile;  // Devuelve el File
    } catch (error) {
      console.error('Error al capturar la foto:', error);
      return null;  // Retorna null en caso de error
    }
  }

  private async convertToFile(cameraPhoto: CameraPhoto): Promise<File> {
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
    const fileName = `foto_${new Date().getTime()}.jpeg`;  // Cambia el nombre del archivo según tus necesidades
    const file = new File([blob], fileName, { type: 'image/jpeg' });
  
    // Log para verificar el File
    // console.log('File creado:', {
    //   name: file.name,
    //   size: file.size,
    //   type: file.type
    // });
    const blobUrl = URL.createObjectURL(blob);
// window.open(blobUrl); // Esto abrirá la imagen en una nueva pestaña


    return file;
  }
}


