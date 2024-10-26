
import { Component, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { addDoc, Firestore } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { collection } from 'firebase/firestore';
import { ModulosComunesModule } from 'src/app/modulos/modulos-comunes/modulos-comunes.module';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [ReactiveFormsModule, ModulosComunesModule, RouterOutlet], // Asegúrate de que todos los módulos necesarios están aquí
  standalone: true,
})
export class LoginComponent {
  formulario: FormGroup;
  isSubmitting: boolean = false;
  accion:string = "Iniciar sesión";
  logeado:any;

  constructor(private fb: FormBuilder, private router: Router, private firestore: Firestore, public auth: Auth) {
    this.formulario = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(6)]],
      // terminos: [false, Validators.requiredTrue]
    });
    this.logeado=auth.authStateReady();
  }

  completarCampos(email: string, clave: string) {
    this.formulario.patchValue({
      email: email,
      clave: clave
    });
  }

  isFormComplete(): boolean {
    return this.formulario.valid;
  }

  registroDatosUsuarios() {
    let col = collection(this.firestore, 'usuarios');
    addDoc(col, { "user": this.email, "rol": "normal" });
  }

  realizarAccion() {
    if (this.isFormComplete()) {
      this.formulario.markAllAsTouched();
      this.isSubmitting = true;
      let promesa: Promise<any>; // Cambiado de Promise<T> a Promise<any> para ser genérico
  
      if (this.accion === "Iniciar sesión") {
        promesa = signInWithEmailAndPassword(this.auth, this.email, this.clave);
      } else {
        promesa = createUserWithEmailAndPassword(this.auth, this.email, this.clave);
      }
  
      promesa.then((res) => {
        if (res.user.email !== null) {
          const parrafo = document.getElementById('mensaje') as HTMLIonTextElement;
  
          if (parrafo) {
            parrafo.setAttribute('color', 'success'); // Corregido de 'succes' a 'success'
  
            if (this.accion === "Iniciar sesión") {
              parrafo.textContent = "Bienvenido " + res.user.email;
              parrafo.textContent = `Usuario iniciado con éxito! Bienvenido ${this.email}`;

            } else {
              parrafo.textContent = `Usuario registrado con éxito! Bienvenido ${this.email}`;
            }
  
            setTimeout(() => {
              // Limpiar el formulario y el mensaje
              this.limpiarForm();
             this.router.navigate(['']); // Navega a la ruta deseada
            }, 2000); // Aumenta el tiempo si es necesario
          }
  
          //this.registroDatosUsuarios(); // Asegúrate de que este método esté correctamente definido
        }
      }).catch((e) => {
        this.motivoMail(e);
      }).finally(() => {
        this.isSubmitting = false;
      });
    }
  }
  
  limpiarForm(){
    const parrafo = document.getElementById('mensaje') as HTMLIonTextElement;
    this.formulario.reset(); // Limpia todos los campos del formulario
    parrafo.textContent = '';
  }

  motivoMail(e: any) {
    // const parrafo = document.getElementById('mensaje');
    const parrafo = document.getElementById('mensaje') as HTMLIonTextElement;
    if (parrafo) {
      // parrafo.color="danger";
      parrafo.setAttribute('color', 'danger');
      // parrafo.classList.add('fontRed');
      
      switch (e.code) {
        case "auth/email-already-in-use":
          parrafo.textContent = 'Usuario ya registrado';
          break;
        case "auth/too-many-requests":
          parrafo.textContent = 'Demasiados intentos. Reestablecer contraseña.';
          break;
        case "auth/invalid-credential":
          parrafo.textContent = 'Contraseña o correo incorrectos!';
          break;
        case "auth/weak-password":
          parrafo.textContent = 'Contraseña muy corta, debe tener al menos 6 caracteres';
          break;
        case "auth/invalid-email":
          parrafo.textContent = 'Correo inválido. Debe ser una cuenta de correo electrónico';
          break;
        case "auth/missing-password":
          parrafo.textContent = 'Falta ingresar la clave';
          break;
        default:
          parrafo.textContent = 'Hubo un error, no se pudo proceder.';
      }
    }
  }


  cerrarSesion(){
    this.limpiarForm();
    this.auth.signOut();
}

  get email() {
    return this.formulario.get('email')?.value;
  }

  get clave() {
    return this.formulario.get('clave')?.value;
  }
}
