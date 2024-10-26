import { Component, OnInit } from '@angular/core';
import { ModulosComunesModule } from 'src/app/modulos/modulos-comunes/modulos-comunes.module';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  // standalone: true,
  // imports:[ModulosComunesModule]

})
export class LoaderComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
