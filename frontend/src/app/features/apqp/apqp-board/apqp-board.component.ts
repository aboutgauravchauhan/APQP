import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../../core/services/api.service';
import { ProjectApqpTask, ApqpPhase } from '../../../core/models';

@Component({
  selector: 'app-apqp-board',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">APQP Workflow Board</div>
        <div class="page-subtitle">Phase-wise task tracking for all programs</div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="flex items-center gap-3">
        <label style="font-weight: 600; font-size: 0.875rem">Project ID:</label>
        <input type="number" [(ngModel)]="projectId" placeholder="Enter project ID"
               class="simple-input" (keyup.enter)="loadTasks()">
        <button mat-raised-button color="primary" (click)="loadTasks()">
          <mat-icon>search</mat-icon> Load Tasks
        </button>
      </div>
    </div>

    <div *ngFor="let phase of phases()" class="phase-section mb-4">
      <div class="phase-header-bar">
        <div class="phase-seq">{{ phase.sequenceNo }}</div>
        <div class="phase-info">
          <div class="phase-name">{{ phase.phaseName }}</div>
          <div class="phase-desc">{{ phase.description }}</div>
        </div>
        <div class="phase-stats">
          <span class="stat-pill green">{{ getCompletedForPhase(phase.id) }} Done</span>
          <span class="stat-pill amber">{{ getOverdueForPhase(phase.id) }} Overdue</span>
          <span class="stat-pill blue">{{ getTotalForPhase(phase.id) }} Total</span>
        </div>
        <div class="progress-bar" style="width: 160px">
          <div class="progress-fill blue" [style.width.%]="getPhasePct(phase.id)"></div>
        </div>
      </div>

      <div class="task-grid" *ngIf="getTasksForPhase(phase.id).length">
        <div *ngFor="let task of getTasksForPhase(phase.id)"
             class="task-card" [class]="'task-' + task.riskLevel.toLowerCase()">
          <div class="task-top">
            <span class="task-code">{{ task.taskCode }}</span>
            <span class="status-chip" [class]="task.status.toLowerCase().replace('_', '-')">
              {{ task.status }}
            </span>
          </div>
          <div class="task-name">{{ task.taskName }}</div>
          <div class="task-footer">
            <span style="font-size: 0.75rem; color: var(--color-text-muted)">
              Due: {{ task.plannedEnd | date:'dd MMM' }}
            </span>
            <span class="rag-badge" [class]="task.riskLevel.toLowerCase()">
              {{ task.riskLevel }}
            </span>
          </div>
          <div class="progress-bar" style="margin-top: 8px">
            <div class="progress-fill blue" [style.width.%]="task.percentComplete"></div>
          </div>
        </div>
      </div>

      <div *ngIf="!getTasksForPhase(phase.id).length" class="empty-phase">
        No tasks in this phase for selected project
      </div>
    </div>
  `,
  styles: [`
    .simple-input {
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 0.875rem;
      width: 160px;
    }

    .phase-section { border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; background: white; }

    .phase-header-bar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 16px;
      background: linear-gradient(to right, #1e1b4b, #312e81);
      color: white;
    }

    .phase-seq {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .phase-info { flex: 1; }
    .phase-name { font-weight: 700; font-size: 0.9rem; }
    .phase-desc { font-size: 0.75rem; color: rgba(255,255,255,0.7); }

    .phase-stats { display: flex; gap: 8px; }

    .stat-pill {
      padding: 2px 10px;
      border-radius: 100px;
      font-size: 0.7rem;
      font-weight: 700;
      &.green { background: rgba(22,163,74,0.3); }
      &.amber { background: rgba(217,119,6,0.3); }
      &.blue  { background: rgba(59,130,246,0.3); }
    }

    .task-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
      padding: 16px;
    }

    .task-card {
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--color-border);
      background: white;
      border-left: 3px solid #e2e8f0;

      &.task-red    { border-left-color: var(--rag-red); background: #fff5f5; }
      &.task-amber  { border-left-color: var(--rag-amber); background: #fffbeb; }
      &.task-green  { border-left-color: var(--rag-green); }
    }

    .task-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .task-code { font-size: 0.7rem; color: var(--color-text-muted); font-weight: 600; }
    .task-name { font-size: 0.875rem; font-weight: 600; margin-bottom: 8px; line-height: 1.3; }
    .task-footer { display: flex; align-items: center; justify-content: space-between; }

    .empty-phase {
      padding: 20px;
      text-align: center;
      color: var(--color-text-muted);
      font-size: 0.875rem;
    }
  `]
})
export class ApqpBoardComponent implements OnInit {
  private api = inject(ApiService);

  phases = signal<ApqpPhase[]>([]);
  tasks = signal<ProjectApqpTask[]>([]);
  projectId = 0;

  ngOnInit() {
    this.api.getApqpPhases().subscribe(phases => this.phases.set(phases));
  }

  loadTasks() {
    if (this.projectId) {
      this.api.getProjectApqpTasks(this.projectId).subscribe(tasks => this.tasks.set(tasks));
    }
  }

  getTasksForPhase(phaseId: number): ProjectApqpTask[] {
    return this.tasks().filter(t => t.phaseId === phaseId);
  }

  getTotalForPhase(phaseId: number): number { return this.getTasksForPhase(phaseId).length; }
  getCompletedForPhase(phaseId: number): number { return this.getTasksForPhase(phaseId).filter(t => t.status === 'COMPLETED').length; }
  getOverdueForPhase(phaseId: number): number { return this.getTasksForPhase(phaseId).filter(t => t.status === 'OVERDUE').length; }

  getPhasePct(phaseId: number): number {
    const total = this.getTotalForPhase(phaseId);
    if (!total) return 0;
    return Math.round((this.getCompletedForPhase(phaseId) / total) * 100);
  }
}
