import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DatosServiceService } from 'src/app/services/datos/datos-service.service';
import { FotoService } from 'src/app/services/foto/foto.service';
import { confirmarCalveValidator } from 'src/app/validadores/clave.validator';
import { isNumberValidator } from 'src/app/validadores/numero.validator';

@Component({
  selector: 'app-alta-usuarios',
  templateUrl: './alta-usuarios.component.html',
  styleUrls: ['./alta-usuarios.component.scss'],
  imports:[ CommonModule, ReactiveFormsModule, IonicModule],
  standalone:true
})
export class AltaUsuariosComponent  implements OnInit {
  formulario: FormGroup;
  isSubmitting: boolean = false;
  loader = false;
  imagenSubida:any=false;
  perfiles: string[] = [];
  @Input() tipo="Empleados";

  constructor(private formBuilder: FormBuilder,private fotosService: FotoService,private cdr: ChangeDetectorRef, public auth: Auth,
    private newAuth: Auth, private datosService:DatosServiceService) { 
    this.formulario = this.formBuilder.group({
      nombre: ['', [Validators.pattern('^[a-zA-Z ]+$'), Validators.required]],
      apellido: ['', [Validators.pattern('^[a-zA-Z ]+$'), Validators.required]],
      dni: ['', [isNumberValidator(),Validators.required, Validators.min(10000000)]],
      correo: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(6)]],
      repiteClave: ['', [Validators.required]],
      foto: ['', [Validators.required]],
    }, {
      validators: confirmarCalveValidator()
    });
  }

  ngOnInit() {
    if(this.tipo=="Dueño" || this.tipo=="Supervisor" ){
      this.perfiles= ['Dueño', 'Supervisor']
    } else{
        this.perfiles= ['Maître', 'Mozo','Cocinero', 'Bartender']
    }
  }

  async guardarDatos(){
    if (this.formulario.valid) {
      
      this.formulario.markAllAsTouched();
      this.formulario.markAsPristine();
      this.isSubmitting = true;
      try {
        let nuevoUsuario = await this.crearOtroUsuario();
        if (nuevoUsuario.user) {
        let urlFotoSubida = await this.datosService.subirImagenAsync("Fotos de perfil", `${this.dni?.value}-FotoDePerfil`, this.imagenSubida.fotoCamara);
        await this.datosService.guardarDatos("usuarios", this.ajustarDatos(urlFotoSubida));
         this.datosService.guardarDatos("usuarios", {prueba:"prueba"});
        this.formulario.reset();
        this.imagenSubida=false;
        console.log("Subida exitosa");
        }
      }  catch (error) {
        this.motivoMail(error);       
      } finally {
        this.isSubmitting = false;
      }
    } else {
      console.log("Error, formulario incompleto");
    }


  }
  ajustarDatos(url:String){
    const formData = { ...this.formulario.value };
    const keysToRemove = ["repiteClave"];
    keysToRemove.forEach(key => delete formData[key]);
    formData.foto=url;
    formData.tipoUsuario=this.tipo;
    formData.aprobado=false;
    return formData;
  }



  async crearOtroUsuario(){
    const authGuardado = this.auth.currentUser;
    let userCredential;
      // Si hay un usuario autenticado, usa newAuth para crear una nueva cuenta
      userCredential = await createUserWithEmailAndPassword(
        this.newAuth,
        this.formulario.get('correo')?.value,
        this.formulario.get('clave')?.value
      );
      this.auth.updateCurrentUser(authGuardado);
      return userCredential;
    }







  async sacarFoto() {
    this.loader=true;
    let foto = await this.fotosService.guardarFoto();
    if (foto) {
        this.imagenSubida={
       foto:URL.createObjectURL(foto),
        fotoCamara:foto}
    }
    this.foto?.setValue(foto);
    this.cdr.detectChanges(); // Forzar actualización de la vista
    this.loader=false;
  }


  motivoMail(error: any) {
    let texto = "Error al registrar usuario";
  
    if (error && error.code) {
      switch (error.code) {
        case "auth/email-already-in-use":
          texto = 'Mail ya registrado';
          break;
        case "auth/too-many-requests":
          texto = 'Demasiados intentos. Reestablecer contraseña.';
          break;
        case "auth/invalid-credential":
          texto = 'Contraseña o email incorrectos!';
          break;
        case "auth/weak-password":
          texto = 'Contraseña muy corta, debe tener al menos 6 caracteres';
          break;
        case "auth/invalid-email":
          texto = 'Correo inválido. Debe ser una cuenta de correo electrónico válida';
          break;
        case "auth/missing-password":
          texto = 'Falta ingresar la clave';
          break;
        default:
          texto = 'Hubo un error, no se pudo proceder.';
      }
    }
    console.log(texto);
    // this.alertas.autoCloseAlert(texto, 3000);
  }



  get nombre() {
    return this.formulario.get('nombre');
  }

  get apellido() {
    return this.formulario.get('apellido');
  }

  get dni() {
    return this.formulario.get('dni');
  }


  get correo() {
    return this.formulario.get('correo');
  }

  get clave() {
    return this.formulario.get('clave');
  }

  get repiteClave() {
    return this.formulario.get('repiteClave');
  }

  get foto() {
    return this.formulario.get('foto');
  }

}
