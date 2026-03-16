import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { Vendor } from '../../../core/models';

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">Vendor Management</div>
        <div class="page-subtitle">Vendor qualification, scoring, and development tracking</div>
      </div>
      <button mat-raised-button color="primary" (click)="showNewForm.set(true)">
        <mat-icon>add</mat-icon> Add Vendor
      </button>
    </div>

    <!-- New Vendor Form -->
    <div class="card mb-4" *ngIf="showNewForm()">
      <h3 style="margin: 0 0 16px; font-size: 1rem; font-weight: 700">Add New Vendor</h3>
      <div class="grid-3">
        <div class="form-group">
          <label>Vendor Code *</label>
          <input type="text" [(ngModel)]="newVendor.vendorCode" class="input-field" placeholder="VND-001">
        </div>
        <div class="form-group">
          <label>Vendor Name *</label>
          <input type="text" [(ngModel)]="newVendor.vendorName" class="input-field">
        </div>
        <div class="form-group">
          <label>Vendor Type *</label>
          <select [(ngModel)]="newVendor.vendorType" class="input-field">
            <option value="COMPONENT">Component Supplier</option>
            <option value="TOOLING">Tooling Supplier</option>
            <option value="SERVICE">Service Vendor</option>
            <option value="RM">Raw Material</option>
          </select>
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" [(ngModel)]="newVendor.location" class="input-field">
        </div>
        <div class="form-group">
          <label>Contact Person</label>
          <input type="text" [(ngModel)]="newVendor.contactPerson" class="input-field">
        </div>
        <div class="form-group">
          <label>Contact Email</label>
          <input type="email" [(ngModel)]="newVendor.contactEmail" class="input-field">
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button mat-stroked-button (click)="showNewForm.set(false)">Cancel</button>
        <button mat-raised-button color="primary" (click)="createVendor()">
          <mat-icon>save</mat-icon> Add Vendor
        </button>
      </div>
    </div>

    <!-- Scorecard Summary Row -->
    <div class="grid-4 mb-4">
      <div class="kpi-card">
        <mat-icon style="color: #16a34a; font-size: 24px">verified</mat-icon>
        <div class="kpi-value" style="color: #16a34a">{{ approvedCount() }}</div>
        <div class="kpi-label">Approved</div>
      </div>
      <div class="kpi-card">
        <mat-icon style="color: #d97706; font-size: 24px">hourglass_empty</mat-icon>
        <div class="kpi-value" style="color: #d97706">{{ pendingCount() }}</div>
        <div class="kpi-label">Not Evaluated</div>
      </div>
      <div class="kpi-card">
        <mat-icon style="color: #0891b2; font-size: 24px">build</mat-icon>
        <div class="kpi-value" style="color: #0891b2">{{ conditionalCount() }}</div>
        <div class="kpi-label">Conditional</div>
      </div>
      <div class="kpi-card">
        <mat-icon style="color: #dc2626; font-size: 24px">block</mat-icon>
        <div class="kpi-value" style="color: #dc2626">{{ rejectedCount() }}</div>
        <div class="kpi-label">Rejected/Blacklisted</div>
      </div>
    </div>

    <!-- Vendor Table -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Vendor Code</th>
            <th>Vendor Name</th>
            <th>Type</th>
            <th>Location</th>
            <th>Status</th>
            <th>Approval</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of vendors()">
            <td style="font-weight: 700">{{ v.vendorCode }}</td>
            <td>{{ v.vendorName }}</td>
            <td>{{ v.vendorType }}</td>
            <td>{{ v.location || '—' }}</td>
            <td><span class="status-chip" [class]="v.status.toLowerCase()">{{ v.status }}</span></td>
            <td>
              <span class="rag-badge"
                [class.green]="v.approvalStatus === 'APPROVED'"
                [class.amber]="v.approvalStatus === 'CONDITIONAL' || v.approvalStatus === 'NOT_EVALUATED'"
                [class.red]="v.approvalStatus === 'REJECTED'">
                {{ v.approvalStatus }}
              </span>
            </td>
            <td>
              <button mat-stroked-button color="primary" (click)="approve(v.id)"
                      *ngIf="v.approvalStatus !== 'APPROVED'">
                <mat-icon>check</mat-icon> Approve
              </button>
              <button mat-stroked-button color="warn" (click)="reject(v.id)"
                      *ngIf="v.approvalStatus === 'APPROVED'">
                <mat-icon>block</mat-icon> Reject
              </button>
            </td>
          </tr>
          <tr *ngIf="!vendors().length">
            <td colspan="7" style="text-align: center; padding: 48px; color: var(--color-text-muted)">
              No vendors found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .input-field {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 0.875rem;
    }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); }
  `]
})
export class VendorListComponent implements OnInit {
  private api = inject(ApiService);

  vendors = signal<Vendor[]>([]);
  showNewForm = signal(false);
  newVendor: any = {};

  ngOnInit() {
    this.api.getVendors(0, 100).subscribe(res => this.vendors.set(res.content));
  }

  createVendor() {
    this.api.createVendor(this.newVendor).subscribe(v => {
      this.vendors.update(list => [v, ...list]);
      this.newVendor = {};
      this.showNewForm.set(false);
    });
  }

  approve(id: number) {
    this.api.updateVendorApproval(id, 'APPROVED').subscribe(updated => {
      this.vendors.update(list => list.map(v => v.id === id ? updated : v));
    });
  }

  reject(id: number) {
    this.api.updateVendorApproval(id, 'REJECTED').subscribe(updated => {
      this.vendors.update(list => list.map(v => v.id === id ? updated : v));
    });
  }

  approvedCount(): number { return this.vendors().filter(v => v.approvalStatus === 'APPROVED').length; }
  pendingCount(): number { return this.vendors().filter(v => v.approvalStatus === 'NOT_EVALUATED').length; }
  conditionalCount(): number { return this.vendors().filter(v => v.approvalStatus === 'CONDITIONAL').length; }
  rejectedCount(): number { return this.vendors().filter(v => v.approvalStatus === 'REJECTED' || v.status === 'BLACKLISTED').length; }
}
