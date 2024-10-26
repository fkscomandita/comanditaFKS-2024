import { Injectable } from '@angular/core';
import { Firestore, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { addDoc, collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatosServiceService {
  collection: any[]=[];
  constructor(private firestore:Firestore) { }
  
  async guardarDatos(nombreDeRegistro: string, objetoAGuardar: any): Promise<any> {
    try {
      // const id = await this.GetId(nombreDeRegistro);
      let col = collection(this.firestore, nombreDeRegistro);
      // console.log(col);
      // if (id != -1) {
        // objetoAGuardar.id = id + 1;
        // console.log(col);
        let doc= await addDoc(col, objetoAGuardar);
        this.modificarDatoAsync(doc.id,nombreDeRegistro,{id:doc.id});
        if(typeof doc.id == "string"){
          return doc.id;
        } else{
          return "Error al subir el dato";
        }

        // console.log('Documento agregado con éxito');
      // } else {
        // console.error('Error: ID no válido obtenido');
      // }
    } catch (error) {
      console.error('Error guardando los datos: ', error);
    }
  }

  async subirImagenAsync(carpeta:string, nombreImagen: string, file: any): Promise<any> {
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `/${carpeta}/${nombreImagen}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }
  
  async getImagenAsync(carpeta:string, nombreImagen: string): Promise<string> {
    try {
      const storage = getStorage();
      const imagesRef = ref(storage, `/${carpeta}/${nombreImagen}`);
      const url = await getDownloadURL(imagesRef);
      return url;
    } catch (error) {
      console.error('Error al obtener la URL de la imagen:', error);
      throw error;
    }
  }
  

  async GetId(nombreDeRegistro: string): Promise<number> {
    let col = collection(this.firestore, nombreDeRegistro);
    const q = query(col, orderBy('id', 'desc'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return 0; // Si no hay documentos, comenzamos desde 0
    } else {
      const doc = snapshot.docs[0];
      return doc.data()["id"] || 0;
    }
  }
  
  ObtenerDatos(nombreDeRegistro: string): Observable<any[]> {
    let col = collection(this.firestore, nombreDeRegistro);
    return collectionData(col, { idField: 'id' }) as Observable<any[]>;
  }

  async ObtenerDatosAsync(nombreDeRegistro: string): Promise<any[]> {
    let col = collection(this.firestore, nombreDeRegistro);
    const snapshot = await getDocs(col);
    // console.log(snapshot);
    return snapshot.docs.map(doc => doc.data());
  }


  modificarDato(id: string, nombreDeRegistro: string, objeto: any): Promise<void> {
    let datoRef = doc(this.firestore, nombreDeRegistro, id);
    return updateDoc(datoRef, objeto);
  }

  async modificarDatoAsync(id: string, nombreDeRegistro: string, objeto: any): Promise<void> {
    const datoRef = doc(this.firestore, nombreDeRegistro, id);
    try {
      await updateDoc(datoRef, objeto);
    } catch (error) {
      console.error('Error al actualizar los datos en la base de datos:', error);
      throw error;
    }
  }
  


  eliminarDato(id: string, nombreDeRegistro: string): Promise<void> {
    let datoRef = doc(this.firestore, nombreDeRegistro, id);
    return deleteDoc(datoRef);
  }
}