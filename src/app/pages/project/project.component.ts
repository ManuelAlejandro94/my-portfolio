import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-project',
  templateUrl: './project.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './project.component.css'
})
export class ProjectComponent implements OnInit {
  constructor(){}

  ngOnInit(): void {}
}
