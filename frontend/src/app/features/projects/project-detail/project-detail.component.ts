import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import { Project, ProjectApqpTask, ApqpPhase } from '../../../core/models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatTabsModule, MatIconModule, MatButtonModule],
  template: `
    <ng-container *ngIf="project()">
      <!-- Project Header Bar -->
      <div class="project-header card mb-4">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="mun-badge">{{ project()!.munNo }}</span>
              <span class="status-chip" [class]="project()!.status.toLowerCase()">{{ project()!.status }}</span>
              <span class="rag-badge" [class]="project()!.riskLevel.toLowerCase()">
                {{ project()!.riskLevel }}
              </span>
            </div>
            <h1 style="margin: 0; font-size: 1.25rem">{{ project()!.projectName }}</h1>
            <div style="color: var(--color-text-muted); font-size: 0.875rem; margin-top: 4px">
              {{ project()!.vehicleName }} | SOP: {{ project()!.sopDate | date:'dd MMM yyyy' }}
            </div>
          </div>
          <div class="header-stats">
            <div class="hstat" *ngIf="project()!.annualVolume">
              <div class="hstat-val">{{ project()!.annualVolume | number }}</div>
              <div class="hstat-lbl">Annual Vol.</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button mat-stroked-button [routerLink]="['/projects', project()!.id, 'edit']">
              <mat-icon>edit</mat-icon> Edit
            </button>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <mat-tab-group animationDuration="0">
        <mat-tab label="APQP Tasks">
          <div style="padding: 20px 0">
            <div *ngFor="let phase of phases()" class="phase-block mb-4">
              <div class="phase-header">
                <span class="phase-label">{{ phase.phaseCode }}: {{ phase.phaseName }}</span>
                <span class="phase-progress">
                  {{ getCompletedCount(phase.id) }}/{{ getPhaseTaskCount(phase.id) }} complete
                </span>
                <div class="progress-bar" style="width: 200px">
                  <div class="progress-fill blue"
                       [style.width.%]="getProgressPct(phase.id)"></div>
                </div>
              </div>

              <table class="data-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Owner</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let task of getTasksForPhase(phase.id)">
                    <td>
                      <div style="font-weight: 500">{{ task.taskName }}</div>
                      <div style="font-size: 0.75rem; color: var(--color-text-muted)">{{ task.taskCode }}</div>
                    </td>
                    <td>{{ task.ownerUserId ? 'User ' + task.ownerUserId : '—' }}</td>
                    <td>{{ task.plannedEnd | date:'dd MMM' }}</td>
                    <td><span class="status-chip" [class]="task.status.toLowerCase().replace('_', '-')">{{ task.status }}</span></td>
                    <td><span class="rag-badge" [class]="task.riskLevel.toLowerCase()">{{ task.riskLevel }}</span></td>
                    <td>{{ task.percentComplete }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="BOM">
          <div style="padding: 20px 0">
            <button mat-raised-button color="primary" [routerLink]="['/bom']"
                    [queryParams]="{ projectId: project()!.id }">
              <mat-icon>account_tree</mat-icon> Open BOM Studio
            </button>
          </div>
        </mat-tab>

        <mat-tab label="ECN">
          <div style="padding: 20px 0">
            <button mat-raised-button color="primary" [routerLink]="['/ecn/new']"
                    [queryParams]="{ projectId: project()!.id }">
              <mat-icon>add</mat-icon> Raise ECN
            </button>
          </div>
        </mat-tab>

        <mat-tab label="PPAP">
          <div style="padding: 20px 0">
            <button mat-raised-button color="primary" [routerLink]="['/ppap']"
                    [queryParams]="{ projectId: project()!.id }">
              <mat-icon>verified</mat-icon> PPAP Cockpit
            </button>
          </div>
        </mat-tab>
      </mat-tab-group>
    </ng-container>
  `,
  styles: [`
    .mun-badge {
      background: #ede9fe;
      color: #5b21b6;
      padding: 2px 12px;
      border-radius: 100px;
      font-size: 0.875rem;
      font-weight: 700;
    }

    .header-stats {
      display: flex;
      gap: 24px;
      border-left: 1px solid var(--color-border);
      padding-left: 24px;
    }

    .hstat { text-align: center; }
    .hstat-val { font-size: 1.25rem; font-weight: 700; }
    .hstat-lbl { font-size: 0.75rem; color: var(--color-text-muted); }

    .phase-block { background: white; border-radius: 8px; border: 1px solid var(--color-border); overflow: hidden; }

    .phase-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: #f8fafc;
      border-bottom: 1px solid var(--color-border);
    }

    .phase-label { font-weight: 700; font-size: 0.875rem; flex: 1; }
    .phase-progress { font-size: 0.75rem; color: var(--color-text-muted); }
  `]
})
export class ProjectDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  project = signal<Project | null>(null);
  tasks = signal<ProjectApqpTask[]>([]);
  phases = signal<ApqpPhase[]>([]);

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.api.getProject(id).subscribe(p => this.project.set(p));
    this.api.getApqpPhases().subscribe(phases => this.phases.set(phases));
    this.api.getProjectApqpTasks(id).subscribe(tasks => this.tasks.set(tasks));
  }

  getTasksForPhase(phaseId: number): ProjectApqpTask[] {
    return this.tasks().filter(t => t.phaseId === phaseId);
  }

  getPhaseTaskCount(phaseId: number): number {
    return this.getTasksForPhase(phaseId).length;
  }

  getCompletedCount(phaseId: number): number {
    return this.getTasksForPhase(phaseId).filter(t => t.status === 'COMPLETED').length;
  }

  getProgressPct(phaseId: number): number {
    const total = this.getPhaseTaskCount(phaseId);
    if (!total) return 0;
    return Math.round((this.getCompletedCount(phaseId) / total) * 100);
  }
}
