import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from '../../../core/services/api.service';
import { Project } from '../../../core/models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">Programs / Projects</div>
        <div class="page-subtitle">{{ total() }} total programs</div>
      </div>
      <button mat-raised-button color="primary" routerLink="/projects/new">
        <mat-icon>add</mat-icon> New Program
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="flex items-center gap-3">
        <mat-form-field appearance="outline" style="width: 300px; margin-bottom: -20px">
          <mat-label>Search programs</mat-label>
          <input matInput [(ngModel)]="searchText" placeholder="MUN, project name, customer...">
          <mat-icon matPrefix>search</mat-icon>
        </mat-form-field>

        <div class="flex gap-2" style="margin-left: auto">
          <button mat-stroked-button [class.active-filter]="statusFilter() === 'ALL'"
                  (click)="statusFilter.set('ALL')">All</button>
          <button mat-stroked-button [class.active-filter]="statusFilter() === 'ACTIVE'"
                  (click)="statusFilter.set('ACTIVE')">Active</button>
          <button mat-stroked-button [class.active-filter]="statusFilter() === 'DRAFT'"
                  (click)="statusFilter.set('DRAFT')">Draft</button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>MUN No</th>
            <th>Program Name</th>
            <th>Customer</th>
            <th>SOP Date</th>
            <th>Status</th>
            <th>Risk</th>
            <th>Program Manager</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filteredProjects()">
            <td>
              <a [routerLink]="['/projects', p.id]" style="color: var(--color-primary); font-weight: 600">
                {{ p.munNo }}
              </a>
            </td>
            <td>
              <div style="font-weight: 500">{{ p.projectName }}</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted)">{{ p.projectCode }}</div>
            </td>
            <td>{{ p.customerName || 'Customer ' + p.customerId }}</td>
            <td>
              <span *ngIf="p.sopDate; else noDate">{{ p.sopDate | date:'dd MMM yyyy' }}</span>
              <ng-template #noDate><span style="color: var(--color-text-muted)">—</span></ng-template>
            </td>
            <td><span class="status-chip" [class]="p.status.toLowerCase().replace('_', '-')">{{ p.status }}</span></td>
            <td>
              <span class="rag-badge" [class]="p.riskLevel.toLowerCase()">
                {{ p.riskLevel }}
              </span>
            </td>
            <td>{{ p.projectManagerName || '—' }}</td>
            <td>
              <button mat-icon-button [routerLink]="['/projects', p.id]" matTooltip="View">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button [routerLink]="['/projects', p.id, 'edit']" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </tr>
          <tr *ngIf="!filteredProjects().length">
            <td colspan="8" style="text-align: center; padding: 48px; color: var(--color-text-muted)">
              No programs found.
              <a routerLink="/projects/new" style="color: var(--color-primary)">Create the first program →</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .active-filter { background: var(--color-primary) !important; color: white !important; }
  `]
})
export class ProjectListComponent implements OnInit {
  private api = inject(ApiService);
  projects = signal<Project[]>([]);
  total = signal(0);
  searchText = '';
  statusFilter = signal<string>('ALL');

  ngOnInit() {
    this.api.getProjects(0, 100).subscribe(res => {
      this.projects.set(res.content);
      this.total.set(res.totalElements);
    });
  }

  filteredProjects(): Project[] {
    return this.projects().filter(p => {
      const matchSearch = !this.searchText ||
        p.projectName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        p.munNo.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = this.statusFilter() === 'ALL' || p.status === this.statusFilter();
      return matchSearch && matchStatus;
    });
  }
}
