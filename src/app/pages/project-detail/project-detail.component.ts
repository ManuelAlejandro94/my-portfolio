import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './project-detail.component.css'
})
export class ProjectDetailComponent implements OnInit{
  constructor(){}

  ngOnInit(): void {
    
  }
}
