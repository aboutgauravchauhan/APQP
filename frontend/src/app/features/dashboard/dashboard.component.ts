import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/services/api.service';
import { DashboardSummary } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">Executive Dashboard</div>
        <div class="page-subtitle">Real-time development visibility across all programs</div>
      </div>
      <button mat-raised-button color="primary" routerLink="/projects/new">
        <mat-icon>add</mat-icon> New Program
      </button>
    </div>

    <!-- KPI Row -->
    <div class="grid-5 mb-6" *ngIf="summary()">
      <div class="kpi-card">
        <mat-icon style="color: #3730a3; font-size: 28px">folder_open</mat-icon>
        <div class="kpi-value" style="color: #3730a3">{{ summary()!.totalActiveProjects }}</div>
        <div class="kpi-label">Active Programs</div>
      </div>
      <div class="kpi-card">
        <mat-icon style="color: #dc2626; font-size: 28px">warning</mat-icon>
        <div class="kpi-value" style="color: #dc2626">{{ summary()!.overdueTasks }}</div>
        <div class="kpi-label">Overdue Tasks</div>
      </div>
      <div class="kpi-card">
        <mat-icon style="color: #d97706; font-size: 28px">change_circle</mat-icon>
        <div class="kpi-value" style="color: #d97706">{{ summary()!.openEcns }}</div>
        <div class="kpi-label">Open ECNs</div>
      </div>
      <div class="kpi-card">
        <mat-icon style="color: #dc2626; font-size: 28px">verified</mat-icon>
        <div class="kpi-value" style="color: #dc2626">{{ summary()!.ppapResubmissionRequired }}</div>
        <div class="kpi-label">PPAP Resubmit</div>
      </div>
      <div class="kpi-card">
        <mat-icon style="color: #dc2626; font-size: 28px">flag</mat-icon>
        <div class="kpi-value" style="color: #dc2626">{{ summary()!.projectsAtRisk }}</div>
        <div class="kpi-label">Red Risk Projects</div>
      </div>
    </div>

    <div class="grid-2">
      <!-- Alerts Panel -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 style="margin: 0; font-size: 1rem; font-weight: 600">Active Alerts</h3>
          <span class="rag-badge red" *ngIf="redAlerts() > 0">{{ redAlerts() }} Critical</span>
        </div>

        <div *ngIf="!summary()?.alerts?.length" class="empty-state">
          <mat-icon style="font-size: 40px; color: #16a34a">check_circle</mat-icon>
          <p>No active alerts. All systems on track.</p>
        </div>

        <div class="alert-list">
          <div *ngFor="let alert of summary()?.alerts" class="alert-item"
               [class]="'alert-' + alert.severity.toLowerCase()">
            <mat-icon class="alert-icon">
              {{ alert.severity === 'RED' ? 'error' : alert.severity === 'AMBER' ? 'warning' : 'info' }}
            </mat-icon>
            <div class="alert-body">
              <div class="alert-message">{{ alert.message }}</div>
              <div class="alert-type">{{ alert.entityType }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h3 style="margin: 0 0 16px; font-size: 1rem; font-weight: 600">Quick Navigation</h3>
        <div class="quick-actions">
          <a *ngFor="let action of quickActions" [routerLink]="action.route" class="quick-action-card">
            <mat-icon [style.color]="action.color">{{ action.icon }}</mat-icon>
            <span class="qa-label">{{ action.label }}</span>
            <span class="qa-desc">{{ action.desc }}</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Second row: Program status overview -->
    <div class="card mt-4" *ngIf="summary()">
      <div class="flex items-center justify-between mb-4">
        <h3 style="margin: 0; font-size: 1rem; font-weight: 600">Program Health Overview</h3>
        <a routerLink="/projects" style="color: var(--color-primary); font-size: 0.875rem">
          View all programs →
        </a>
      </div>
      <div class="grid-4">
        <div class="stat-box green">
          <div class="stat-num">{{ summary()!.projectsOnSchedule }}</div>
          <div class="stat-lbl">On Schedule</div>
        </div>
        <div class="stat-box amber">
          <div class="stat-num">{{ summary()!.projectsDelayed }}</div>
          <div class="stat-lbl">Delayed</div>
        </div>
        <div class="stat-box red">
          <div class="stat-num">{{ summary()!.projectsAtRisk }}</div>
          <div class="stat-lbl">At Risk (RED)</div>
        </div>
        <div class="stat-box blue">
          <div class="stat-num">{{ summary()!.projectsCompleted }}</div>
          <div class="stat-lbl">Completed</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--color-text-muted);
      p { margin: 8px 0 0; }
    }

    .alert-list { display: flex; flex-direction: column; gap: 8px; }

    .alert-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 8px;

      &.alert-red    { background: #fee2e2; .alert-icon { color: #dc2626; } }
      &.alert-amber  { background: #fef3c7; .alert-icon { color: #d97706; } }
      &.alert-green  { background: #dcfce7; .alert-icon { color: #16a34a; } }
    }

    .alert-message { font-size: 0.875rem; font-weight: 500; }
    .alert-type { font-size: 0.75rem; color: var(--color-text-muted); }

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .quick-action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 16px 12px;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      text-decoration: none;
      color: var(--color-text);
      transition: all 0.15s;
      gap: 6px;

      &:hover { background: var(--color-bg); border-color: var(--color-primary-light); }

      mat-icon { font-size: 28px; }
    }

    .qa-label { font-size: 0.875rem; font-weight: 600; }
    .qa-desc { font-size: 0.75rem; color: var(--color-text-muted); }

    .stat-box {
      padding: 20px;
      border-radius: 8px;
      text-align: center;

      &.green  { background: #dcfce7; }
      &.amber  { background: #fef3c7; }
      &.red    { background: #fee2e2; }
      &.blue   { background: #dbeafe; }

      .stat-num { font-size: 1.75rem; font-weight: 800; }
      .stat-lbl { font-size: 0.75rem; font-weight: 600; color: var(--color-text-muted); margin-top: 4px; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  summary = signal<DashboardSummary | null>(null);

  quickActions = [
    { label: 'BOM Studio',    desc: 'Build & manage BOM',       icon: 'account_tree',  route: '/bom',     color: '#4f46e5' },
    { label: 'APQP Tasks',   desc: 'Track phase tasks',         icon: 'timeline',      route: '/apqp',    color: '#0891b2' },
    { label: 'Raise ECN',    desc: 'Engineering change',        icon: 'change_circle', route: '/ecn/new', color: '#d97706' },
    { label: 'PPAP Cockpit', desc: 'Submission tracker',        icon: 'verified',      route: '/ppap',    color: '#16a34a' },
    { label: 'Vendors',      desc: 'Qualification & scoring',   icon: 'factory',       route: '/vendors', color: '#7c3aed' },
    { label: 'New Program',  desc: 'Start new development',     icon: 'add_circle',    route: '/projects/new', color: '#ea580c' },
  ];

  ngOnInit() {
    this.api.getDashboard().subscribe(data => this.summary.set(data));
  }

  redAlerts(): number {
    return this.summary()?.alerts.filter(a => a.severity === 'RED').length ?? 0;
  }
}
