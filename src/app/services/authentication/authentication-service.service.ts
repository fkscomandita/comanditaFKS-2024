import { Injectable } from '@angular/core';
import { Auth, signOut } from '@angular/fire/auth';
import { Observable, Subject } from 'rxjs';
import { DatosServiceService } from '../datos/datos-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService {
  public rol="";
  public verificado=false;
  public email="";
  private datosTraidos:Observable<any[]>;
  public usuario:any=[];

  constructor(private auth:Auth, private datos: DatosServiceService) {
    this.datosTraidos=this.datos.ObtenerDatos("usuarios");
  }
  
  
  
  setAuth(auth:Auth){
    this.auth=auth;
  }

  getAuth (){
    return this.auth;
  }


  async estaVerificado() {
    //  await this.auth.currentUser
    try {
      const datos = await this.datos.ObtenerDatosAsync("usuarios");
        if ( !this.auth.currentUser) {
          // console.error('No hay un usuario autenticado.');
          return false;
        }
        const mail = this.auth.currentUser.email;
      const usuarioActual = datos.find(usuario => usuario.user === mail);
      if (usuarioActual) {
        this.rol = usuarioActual.rol;
        this.email=usuarioActual.user;
      }

    } catch (error) {
      console.error("Error al obtener los datos:", error);
      this.verificado = false;
    }
    return this.verificado;
  }
  
   traerDatos() {
      this.datosTraidos.subscribe((usuarios:any) => {
        const usuarioActual: any | null = usuarios.find((usuario:any)=>{
          if(usuario.mail === this.auth.currentUser?.email){
            return usuario
            }
            } );
            
      if (usuarioActual) {
        this.usuario=usuarioActual;
        this.rol = usuarioActual.rol;
      } else {
        // console.log("Usuario no encontrado");
        this.verificado = false;
        this.email="";
        if(this.auth.currentUser==null){
          this.rol="no user logeado";
        }

        // console.log(this.auth)
      }});
    } 
    // return this.verificado;
  
  
  
   checkAuthentication() {
    // this.auth.onAuthStateChanged
    const user =  this.auth.currentUser;
    // console.log(user);
    if (user) {
      return this.auth;
    } else {
      return null;
    }
  }

  async cerrarSesion() {
    // this.estado = false;
    // this.admin = false;
    // this.emailLogueado.next('')
    this.auth.signOut();
    this.verificado = false;
    this.email="";
    this.rol="";
  }


}
