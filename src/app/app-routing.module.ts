import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "./pages/home/home.component";
import { ProjectDetailComponent } from "./pages/project-detail/project-detail.component";
import { AboutComponent } from "./pages/about/about.component";
import { TranslateModule } from '@ngx-translate/core';
import { ProjectComponent } from "./pages/project/project.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { WorkingComponent } from "./shared/working/working.component";

const app_routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'projects', component: ProjectComponent },
    { path: 'project/:id', component: ProjectDetailComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'working', component: WorkingComponent },
    { path: '**', pathMatch:'full', redirectTo: 'home' }
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