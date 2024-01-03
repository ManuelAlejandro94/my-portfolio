import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ProjectDetailComponent } from "./pages/project-detail/project-detail.component";
import { AboutComponent } from "./pages/about/about.component";
import { TranslateModule } from '@ngx-translate/core';

const app_routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'project/:id', component: ProjectDetailComponent },
    { path: '**', pathMatch:'full', redirectTo: 'home' },
];

@NgModule({
    imports: [
        RouterModule.forRoot( app_routes, { useHash: true } ),
        TranslateModule.forRoot()
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule {
}