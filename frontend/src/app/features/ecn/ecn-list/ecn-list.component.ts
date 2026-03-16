import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../../core/services/api.service';
import { ChangeRequest, EcnImpactedObject } from '../../../core/models';

@Component({
  selector: 'app-ecn-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatDialogModule],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">ECN Management</div>
        <div class="page-subtitle">Engineering Change Notice Impact Engine</div>
      </div>
      <button mat-raised-button color="primary" (click)="showNewForm.set(true)">
        <mat-icon>add</mat-icon> Raise ECN
      </button>
    </div>

    <!-- New ECN Form -->
    <div class="card mb-4" *ngIf="showNewForm()">
      <h3 style="margin: 0 0 16px; font-size: 1rem; font-weight: 700">
        <mat-icon style="vertical-align: middle">change_circle</mat-icon> Raise Engineering Change Notice
      </h3>
      <div class="grid-2">
        <div class="form-group">
          <label>Project ID *</label>
          <input type="number" [(ngModel)]="newEcn.projectId" class="input-field" placeholder="Project ID">
        </div>
        <div class="form-group">
          <label>Part ID (if applicable)</label>
          <input type="number" [(ngModel)]="newEcn.partId" class="input-field" placeholder="Part ID">
        </div>
        <div class="form-group">
          <label>Change Type *</label>
          <select [(ngModel)]="newEcn.ecnType" class="input-field">
            <option value="">Select type...</option>
            <option value="DESIGN_CHANGE">Design Change</option>
            <option value="PROCESS_CHANGE">Process Change</option>
            <option value="MATERIAL_CHANGE">Material Change</option>
            <option value="VENDOR_CHANGE">Vendor Change</option>
            <option value="TOOLING_CHANGE">Tooling Change</option>
            <option value="COST_REDUCTION">Cost Reduction</option>
            <option value="QUALITY_IMPROVEMENT">Quality Improvement</option>
          </select>
        </div>
        <div class="form-group">
          <label>Severity *</label>
          <select [(ngModel)]="newEcn.severity" class="input-field">
            <option value="MINOR">Minor</option>
            <option value="MODERATE">Moderate</option>
            <option value="MAJOR">Major</option>
          </select>
        </div>
        <div class="form-group" style="grid-column: span 2">
          <label>Change Title *</label>
          <input type="text" [(ngModel)]="newEcn.title" class="input-field" placeholder="Brief description of the change">
        </div>
        <div class="form-group" style="grid-column: span 2">
          <label>Reason *</label>
          <textarea [(ngModel)]="newEcn.reason" class="input-field" rows="3"
                    placeholder="Why is this change needed?"></textarea>
        </div>
        <div class="form-group">
          <label>Old Revision</label>
          <input type="text" [(ngModel)]="newEcn.oldRevision" class="input-field" placeholder="e.g. Rev C">
        </div>
        <div class="form-group">
          <label>New Revision</label>
          <input type="text" [(ngModel)]="newEcn.newRevision" class="input-field" placeholder="e.g. Rev D">
        </div>
      </div>
      <div class="flex gap-2 mt-4">
        <button mat-stroked-button (click)="showNewForm.set(false)">Cancel</button>
        <button mat-raised-button color="primary" (click)="createEcn()">
          <mat-icon>save</mat-icon> Create ECN
        </button>
      </div>
    </div>

    <!-- Load ECNs for a project -->
    <div class="card mb-4">
      <div class="flex items-center gap-3">
        <label style="font-weight: 600; font-size: 0.875rem">Project ID:</label>
        <input type="number" [(ngModel)]="filterProjectId" class="simple-input"
               (keyup.enter)="loadEcns()">
        <button mat-raised-button color="primary" (click)="loadEcns()">
          <mat-icon>search</mat-icon> Load ECNs
        </button>
      </div>
    </div>

    <!-- ECN Table -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>ECN No</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Title</th>
            <th>Status</th>
            <th>Raised By</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let ecn of ecns()">
            <td style="font-weight: 700; color: var(--color-primary)">{{ ecn.ecnNo }}</td>
            <td><span class="status-chip draft">{{ ecn.ecnType | titlecase }}</span></td>
            <td>
              <span class="rag-badge"
                [class.red]="ecn.severity === 'MAJOR'"
                [class.amber]="ecn.severity === 'MODERATE'"
                [class.green]="ecn.severity === 'MINOR'">
                {{ ecn.severity }}
              </span>
            </td>
            <td>{{ ecn.title }}</td>
            <td><span class="status-chip" [class]="ecn.status.toLowerCase().replace('_', '-')">{{ ecn.status }}</span></td>
            <td>{{ ecn.requestedBy }}</td>
            <td>{{ ecn.requestedAt | date:'dd MMM yyyy' }}</td>
            <td>
              <button mat-stroked-button (click)="loadImpacts(ecn.id)">
                <mat-icon>analytics</mat-icon> Impact
              </button>
              <button mat-stroked-button color="primary" (click)="submitEcn(ecn.id)"
                      *ngIf="ecn.status === 'DRAFT'">
                Submit
              </button>
              <button mat-stroked-button color="primary" (click)="approveEcn(ecn.id)"
                      *ngIf="ecn.status === 'SUBMITTED' || ecn.status === 'UNDER_REVIEW'">
                Approve
              </button>
            </td>
          </tr>
          <tr *ngIf="!ecns().length">
            <td colspan="8" style="text-align: center; padding: 40px; color: var(--color-text-muted)">
              No ECNs found. Enter a project ID and click "Load ECNs".
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Impact Panel -->
    <div class="card mt-4" *ngIf="selectedEcnImpacts().length">
      <h3 style="margin: 0 0 16px; font-weight: 700">
        <mat-icon style="vertical-align: middle; color: #d97706">warning</mat-icon>
        ECN Impact Analysis — {{ selectedEcnImpacts().length }} objects impacted
      </h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Object Type</th>
            <th>Reference</th>
            <th>Old Value</th>
            <th>New Value</th>
            <th>Action Required</th>
            <th>Resolved</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let impact of selectedEcnImpacts()">
            <td><span class="status-chip draft">{{ impact.objectType }}</span></td>
            <td>{{ impact.objectRef || impact.objectId }}</td>
            <td style="color: var(--rag-red)">{{ impact.oldValue || '—' }}</td>
            <td style="color: var(--rag-green)">{{ impact.newValue || '—' }}</td>
            <td style="font-size: 0.875rem">{{ impact.actionRequired }}</td>
            <td>
              <span class="rag-badge" [class.green]="impact.isResolved" [class.red]="!impact.isResolved">
                {{ impact.isResolved ? 'Yes' : 'Pending' }}
              </span>
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
    .simple-input {
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 0.875rem;
      width: 160px;
    }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 0.8rem; font-weight: 600; color: var(--color-text-muted); }
    textarea.input-field { resize: vertical; }
  `]
})
export class EcnListComponent implements OnInit {
  private api = inject(ApiService);

  ecns = signal<ChangeRequest[]>([]);
  selectedEcnImpacts = signal<EcnImpactedObject[]>([]);
  showNewForm = signal(false);
  filterProjectId = 0;

  newEcn: any = { severity: 'MODERATE' };

  ngOnInit() {}

  loadEcns() {
    if (this.filterProjectId) {
      this.api.getProjectEcns(this.filterProjectId).subscribe(ecns => this.ecns.set(ecns));
    }
  }

  createEcn() {
    this.api.createEcn(this.newEcn).subscribe(ecn => {
      this.ecns.update(list => [ecn, ...list]);
      this.newEcn = { severity: 'MODERATE' };
      this.showNewForm.set(false);
    });
  }

  submitEcn(id: number) {
    this.api.submitEcn(id).subscribe(updated => {
      this.ecns.update(list => list.map(e => e.id === id ? updated : e));
      this.loadImpacts(id);
    });
  }

  approveEcn(id: number) {
    this.api.approveEcn(id).subscribe(updated => {
      this.ecns.update(list => list.map(e => e.id === id ? updated : e));
    });
  }

  loadImpacts(ecnId: number) {
    this.api.getEcnImpacts(ecnId).subscribe(impacts => this.selectedEcnImpacts.set(impacts));
  }
}
