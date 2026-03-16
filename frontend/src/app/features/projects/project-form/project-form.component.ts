import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">{{ isEdit ? 'Edit Program' : 'New Program' }}</div>
        <div class="page-subtitle">{{ isEdit ? 'Update program details' : 'Create a new development program' }}</div>
      </div>
    </div>

    <div class="card" style="max-width: 900px">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <h3 class="section-title">Program Information</h3>
        <div class="grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Program Name *</mat-label>
            <input matInput formControlName="projectName" placeholder="e.g. Battery Tray Assembly - Honda">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Project Type *</mat-label>
            <mat-select formControlName="projectType">
              <mat-option value="NEW_DEVELOPMENT">New Development</mat-option>
              <mat-option value="RESOURCING">Resourcing</mat-option>
              <mat-option value="ENGINEERING_CHANGE">Engineering Change</mat-option>
              <mat-option value="CAPACITY_EXPANSION">Capacity Expansion</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Customer ID *</mat-label>
            <input matInput type="number" formControlName="customerId" placeholder="Customer ID">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Plant ID *</mat-label>
            <input matInput type="number" formControlName="plantId" placeholder="Plant ID">
          </mat-form-field>
        </div>

        <h3 class="section-title">Vehicle / Part Details</h3>
        <div class="grid-2">
          <mat-form-field appearance="outline">
            <mat-label>Vehicle / Platform Name</mat-label>
            <input matInput formControlName="vehicleName" placeholder="e.g. Honda City, Gen 7">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Customer Part Number</mat-label>
            <input matInput formControlName="customerPartNo">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Internal Part Number</mat-label>
            <input matInput formControlName="internalPartNo">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Model Name</mat-label>
            <input matInput formControlName="modelName">
          </mat-form-field>
        </div>

        <h3 class="section-title">Timeline & Volume</h3>
        <div class="grid-3">
          <mat-form-field appearance="outline">
            <mat-label>SOP Date</mat-label>
            <input matInput [matDatepicker]="sopPicker" formControlName="sopDate">
            <mat-datepicker-toggle matSuffix [for]="sopPicker"></mat-datepicker-toggle>
            <mat-datepicker #sopPicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Sample Date</mat-label>
            <input matInput [matDatepicker]="samplePicker" formControlName="sampleDate">
            <mat-datepicker-toggle matSuffix [for]="samplePicker"></mat-datepicker-toggle>
            <mat-datepicker #samplePicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Annual Volume</mat-label>
            <input matInput type="number" formControlName="annualVolume">
          </mat-form-field>
        </div>

        <div class="form-actions">
          <button mat-stroked-button type="button" routerLink="/projects">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || saving()">
            <mat-icon>{{ saving() ? 'hourglass_empty' : 'save' }}</mat-icon>
            {{ isEdit ? 'Update Program' : 'Create Program' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .section-title {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 20px 0 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border);
    }
    mat-form-field { width: 100%; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
  `]
})
export class ProjectFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEdit = false;
  saving = signal(false);

  form = this.fb.group({
    projectName: ['', Validators.required],
    customerId: [null, Validators.required],
    plantId: [null, Validators.required],
    projectType: ['NEW_DEVELOPMENT', Validators.required],
    vehicleName: [''],
    vehiclePlatform: [''],
    modelName: [''],
    customerPartNo: [''],
    internalPartNo: [''],
    sopDate: [null],
    sampleDate: [null],
    annualVolume: [null],
    dailyVolume: [null],
    projectManagerId: [null]
  });

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit = true;
      this.api.getProject(id).subscribe(p => this.form.patchValue(p as any));
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.saving.set(true);
    const data = this.form.value;
    const id = this.route.snapshot.params['id'];
    const obs = this.isEdit
        ? this.api.updateProject(id, data as any)
        : this.api.createProject(data as any);

    obs.subscribe({
      next: (p) => this.router.navigate(['/projects', p.id]),
      error: () => this.saving.set(false)
    });
  }
}
