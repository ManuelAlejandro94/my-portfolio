import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import Typed from 'typed.js';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(){}

  ngOnInit(): void {
    var options = {
      strings: ['','Full-Stack', 'Backend','Mobile'],
      typeSpeed: 120,
      backSpeed: 100,
      loop: true,
    };
    
    var typed = new Typed('.typed', options);
    typed.reset(true)
  }
}
