import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { PpapPackage } from '../../../core/models';

const PPAP_ELEMENTS = [
  'Design Documentation', 'Engineering Change Documents', 'Customer Engineering Approval',
  'Design FMEA', 'Process Flow Diagram', 'Process FMEA', 'Control Plan',
  'Measurement System Analysis', 'Dimensional Results', 'Material / Performance Test Results',
  'Initial Process Studies (Cpk)', 'Qualified Laboratory Documentation', 'Appearance Approval Report',
  'Sample Product', 'Master Sample', 'Checking Aids', 'Customer Specific Requirements', 'PSW'
];

@Component({
  selector: 'app-ppap-cockpit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">PPAP Cockpit</div>
        <div class="page-subtitle">Part Submission Warrant & PPAP Element Tracker</div>
      </div>
    </div>

    <div class="card mb-4">
      <div class="flex items-center gap-3">
        <label style="font-weight: 600; font-size: 0.875rem">Project ID:</label>
        <input type="number" [(ngModel)]="projectId" class="simple-input" (keyup.enter)="load()">
        <button mat-raised-button color="primary" (click)="load()">
          <mat-icon>search</mat-icon> Load PPAP Packages
        </button>
      </div>
    </div>

    <!-- PPAP Package Cards -->
    <div class="grid-3 mb-4" *ngIf="ppaps().length">
      <div *ngFor="let ppap of ppaps()" class="ppap-card"
           [class.resubmit]="ppap.resubmissionRequired"
           (click)="selectedPpap.set(ppap)">
        <div class="ppap-card-header">
          <div>
            <div style="font-weight: 700">Part {{ ppap.partId }}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted)">{{ ppap.ppapLevel }}</div>
          </div>
          <span class="status-chip" [class]="ppap.overallStatus.toLowerCase().replace('_', '-')">
            {{ ppap.overallStatus }}
          </span>
        </div>

        <div *ngIf="ppap.resubmissionRequired" class="resubmit-banner">
          <mat-icon style="font-size: 16px">warning</mat-icon>
          Resubmission Required
        </div>

        <div class="ppap-progress">
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 4px">
            PSW Status: <span style="font-weight: 600">{{ ppap.pswStatus }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- PPAP Elements Grid (Selected Package) -->
    <div class="card" *ngIf="selectedPpap()">
      <div class="flex items-center justify-between mb-4">
        <h3 style="margin: 0; font-size: 1rem; font-weight: 700">
          PPAP Elements — Part {{ selectedPpap()!.partId }} | {{ selectedPpap()!.ppapLevel }}
        </h3>
        <div class="flex gap-2">
          <button mat-stroked-button color="primary"
                  (click)="updateStatus(selectedPpap()!.id, 'APPROVED')">
            <mat-icon>check_circle</mat-icon> Approve
          </button>
          <button mat-stroked-button color="warn"
                  (click)="updateStatus(selectedPpap()!.id, 'REJECTED')">
            <mat-icon>cancel</mat-icon> Reject
          </button>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>PPAP Element</th>
            <th>Required</th>
            <th>Submitted</th>
            <th>Approved</th>
            <th>Document</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let element of ppapElements; let i = index">
            <td style="color: var(--color-text-muted)">{{ i + 1 }}</td>
            <td style="font-weight: 500">{{ element }}</td>
            <td>
              <mat-icon style="color: var(--rag-green); font-size: 18px">check_circle</mat-icon>
            </td>
            <td>
              <mat-icon style="color: var(--color-border); font-size: 18px">radio_button_unchecked</mat-icon>
            </td>
            <td>
              <mat-icon style="color: var(--color-border); font-size: 18px">radio_button_unchecked</mat-icon>
            </td>
            <td>
              <button mat-icon-button style="width: 28px; height: 28px">
                <mat-icon style="font-size: 16px">upload_file</mat-icon>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card" *ngIf="!ppaps().length && projectId">
      <div style="text-align: center; padding: 48px; color: var(--color-text-muted)">
        <mat-icon style="font-size: 48px">verified</mat-icon>
        <p>No PPAP packages found for this project.</p>
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

    .ppap-card {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.15s;
      background: white;

      &:hover { border-color: var(--color-primary-light); box-shadow: var(--shadow-md); }
      &.resubmit { border-color: var(--rag-amber); }
    }

    .ppap-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }

    .resubmit-banner {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #fef3c7;
      color: var(--rag-amber);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 12px;
    }
  `]
})
export class PpapCockpitComponent {
  private api = inject(ApiService);

  ppaps = signal<PpapPackage[]>([]);
  selectedPpap = signal<PpapPackage | null>(null);
  projectId = 0;
  ppapElements = PPAP_ELEMENTS;

  load() {
    if (this.projectId) {
      this.api.getProjectPpaps(this.projectId).subscribe(ppaps => this.ppaps.set(ppaps));
    }
  }

  updateStatus(ppapId: number, status: string) {
    this.api.updatePpapStatus(ppapId, status).subscribe(updated => {
      this.ppaps.update(list => list.map(p => p.id === ppapId ? updated : p));
      if (this.selectedPpap()?.id === ppapId) this.selectedPpap.set(updated);
    });
  }
}
