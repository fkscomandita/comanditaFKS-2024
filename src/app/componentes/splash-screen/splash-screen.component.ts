import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModulosComunesModule } from 'src/app/modulos/modulos-comunes/modulos-comunes.module';

@Component({
  selector: 'app-splash-screen',
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.scss'],
  standalone:true,
  imports:[ModulosComunesModule, RouterOutlet]
  
})
export class SplashScreenComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}
  

}
