import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-card',
  standalone: true,
  template: `
    <div class="relative w-full max-w-md">
      <!-- soft top glow -->
      <div
        class="pointer-events-none absolute -top-10 left-1/2 h-40 w-4/5 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-3xl"
        aria-hidden="true"
      ></div>

      <div
        class="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900 ring-1 ring-white/5 shadow-2xl shadow-black/40"
      >
        <!-- mini dashboard preview -->
        <div class="relative p-4 pb-0">
          <div class="rounded-xl bg-slate-950/70 border border-white/5 p-3">
            <!-- KPI chips -->
            <div class="grid grid-cols-4 gap-2 mb-3">
              <div class="rounded-lg bg-slate-900/80 border border-white/5 px-2 py-1.5 text-center">
                <div class="text-[11px] font-bold text-cyan-300 leading-tight">8.9M</div>
                <div class="text-[8px] text-slate-500 leading-tight">Events</div>
              </div>
              <div class="rounded-lg bg-slate-900/80 border border-white/5 px-2 py-1.5 text-center">
                <div class="text-[11px] font-bold text-emerald-300 leading-tight">96.7%</div>
                <div class="text-[8px] text-slate-500 leading-tight">Uptime</div>
              </div>
              <div class="rounded-lg bg-slate-900/80 border border-white/5 px-2 py-1.5 text-center">
                <div class="text-[11px] font-bold text-teal-300 leading-tight">512B</div>
                <div class="text-[8px] text-slate-500 leading-tight">Params</div>
              </div>
              <div class="rounded-lg bg-slate-900/80 border border-white/5 px-2 py-1.5 text-center">
                <div class="text-[11px] font-bold text-cyan-300 leading-tight">42</div>
                <div class="text-[8px] text-slate-500 leading-tight">Models</div>
              </div>
            </div>

            <!-- chart row: faux area chart + donut -->
            <div class="flex items-end gap-3">
              <svg viewBox="0 0 160 48" class="h-12 flex-1" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pc-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.45" />
                    <stop offset="100%" stop-color="#2dd4bf" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points="0,40 20,32 40,36 60,20 80,26 100,12 120,18 140,8 160,14 160,48 0,48"
                  fill="url(#pc-area)"
                />
                <polyline
                  points="0,40 20,32 40,36 60,20 80,26 100,12 120,18 140,8 160,14"
                  fill="none"
                  stroke="#22d3ee"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>

              <svg viewBox="0 0 40 40" class="h-12 w-12 shrink-0">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#1e293b" stroke-width="6" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#2dd4bf"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-dasharray="70 100"
                  transform="rotate(-90 20 20)"
                />
              </svg>

              <!-- faux bars -->
              <div class="flex items-end gap-1 h-12 shrink-0">
                <div class="w-1.5 rounded-t bg-cyan-500/70" style="height: 40%"></div>
                <div class="w-1.5 rounded-t bg-cyan-400/70" style="height: 65%"></div>
                <div class="w-1.5 rounded-t bg-teal-400/70" style="height: 50%"></div>
                <div class="w-1.5 rounded-t bg-emerald-400/70" style="height: 85%"></div>
                <div class="w-1.5 rounded-t bg-teal-300/70" style="height: 60%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- body -->
        <div class="p-6 pt-4">
          <span
            class="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300 ring-1 ring-inset ring-cyan-500/20"
          >
            AI/ML
          </span>

          <h2 class="mt-3 text-xl font-bold text-white">Aetherium AI Analytics Platform</h2>

          <p class="mt-2 text-sm leading-relaxed text-slate-400">
            Real-time predictive analytics dashboard with neural net metrics, customizable widgets, and
            sub-10ms query performance.
          </p>

          <div class="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h4l3 8 4-16 3 8h4" />
            </svg>
            <span>Processing 4.2M events/sec</span>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            @for (chip of chips; track chip) {
              <span
                class="rounded-md bg-slate-800 px-2.5 py-1 font-mono text-[11px] text-slate-300 ring-1 ring-inset ring-white/5"
              >
                {{ chip }}
              </span>
            }
          </div>

          <div class="mt-6 flex items-center justify-between">
            <button
              type="button"
              (click)="go()"
              class="group inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
            >
              Learn More
              <span class="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </button>

            <svg
              viewBox="0 0 24 24"
              class="h-4 w-4 text-slate-600"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProjectCardComponent {
  chips: string[] = ['Angular', 'TypeScript', 'Node.js', 'Python', 'Tailwind', 'WebSockets'];

  constructor(private router: Router) {}

  go(): void {
    this.router.navigate(['/login']);
  }
}
