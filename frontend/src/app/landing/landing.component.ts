import { Component } from '@angular/core';
import { ProjectCardComponent } from '../shared/project-card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [ProjectCardComponent],
  template: `
    <div
      class="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-950 px-4 py-16"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.12),_transparent_60%)]"
        aria-hidden="true"
      ></div>
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(45,212,191,0.08),_transparent_55%)]"
        aria-hidden="true"
      ></div>

      <app-project-card class="relative z-10"></app-project-card>
    </div>
  `,
})
export class LandingComponent {}
