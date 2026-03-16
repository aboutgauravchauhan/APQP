import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../core/services/api.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSelectModule
  ],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">Employee Master</div>
        <div class="page-subtitle">All system users / employees</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4" style="display: flex; gap: 16px; align-items: center">
      <mat-form-field appearance="outline" style="width: 300px; margin-bottom: -20px">
        <mat-label>Search employees</mat-label>
        <input matInput [(ngModel)]="searchText" placeholder="Name, email, code...">
      </mat-form-field>
    </div>

    <!-- Employees Table -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Employee Code</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Designation</th>
            <th>Plant</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of filteredUsers()">
            <td><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px">{{ u.employeeCode }}</code></td>
            <td style="font-weight: 500">{{ u.fullName }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.phone || '—' }}</td>
            <td>{{ u.designation || '—' }}</td>
            <td>{{ u.plantId }}</td>
          </tr>
          <tr *ngIf="!filteredUsers().length">
            <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-text-muted)">
              <div *ngIf="loading()">Loading...</div>
              <div *ngIf="!loading()">No employees found.</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class EmployeeListComponent implements OnInit {
  private api = inject(ApiService);

  users = signal<User[]>([]);
  loading = signal(true);
  searchText = '';

  ngOnInit() {
    // Use the auth/users endpoint (if available) or just show placeholder
    // The backend doesn't have a GET /users yet - we show from the auth service context
    this.loading.set(false);
  }

  filteredUsers(): User[] {
    if (!this.searchText) return this.users();
    const q = this.searchText.toLowerCase();
    return this.users().filter(u =>
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.employeeCode || '').toLowerCase().includes(q)
    );
  }
}
