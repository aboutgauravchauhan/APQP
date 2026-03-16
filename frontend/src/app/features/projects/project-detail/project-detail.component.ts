import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ApiService } from '../../../core/services/api.service';
import {
  Project, ProjectApqpTask, ApqpPhase,
  ProgramTeamMember, ProgramMilestone, ProgramCustomerRep, Contact
} from '../../../core/models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink, FormsModule,
    MatTabsModule, MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <ng-container *ngIf="project()">
      <!-- Project Header Bar -->
      <div class="project-header card mb-4">
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="mun-badge">{{ project()!.munNo }}</span>
              <span class="prog-badge">{{ project()!.projectCode }}</span>
              <span class="status-chip" [class]="project()!.status.toLowerCase()">{{ project()!.status }}</span>
              <span class="rag-badge" [class]="project()!.riskLevel.toLowerCase()">
                {{ project()!.riskLevel }}
              </span>
            </div>
            <h1 style="margin: 0; font-size: 1.25rem">{{ project()!.projectName }}</h1>
            <div style="color: var(--color-text-muted); font-size: 0.875rem; margin-top: 4px">
              {{ project()!.customerName || ('Customer ' + project()!.customerId) }}
              <span *ngIf="project()!.vehicleName"> | {{ project()!.vehicleName }}</span>
              <span *ngIf="project()!.sopDate"> | SOP: {{ project()!.sopDate | date:'dd MMM yyyy' }}</span>
            </div>
          </div>
          <div class="header-stats" *ngIf="project()!.annualVolume">
            <div class="hstat">
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

        <!-- APQP Tasks Tab -->
        <mat-tab label="APQP Tasks">
          <div style="padding: 20px 0">
            <div *ngFor="let phase of phases()" class="phase-block mb-4">
              <div class="phase-header">
                <span class="phase-label">{{ phase.phaseCode }}: {{ phase.phaseName }}</span>
                <span class="phase-progress">
                  {{ getCompletedCount(phase.id) }}/{{ getPhaseTaskCount(phase.id) }} complete
                </span>
                <div class="progress-bar" style="width: 200px">
                  <div class="progress-fill blue" [style.width.%]="getProgressPct(phase.id)"></div>
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

        <!-- Milestones Tab -->
        <mat-tab label="Milestones">
          <div style="padding: 20px 0">
            <div class="card mb-3">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
                <h3 style="margin: 0; font-size: 1rem">Program Milestones</h3>
                <button mat-raised-button color="primary" (click)="showMilestoneForm = !showMilestoneForm">
                  <mat-icon>add</mat-icon> Add Milestone
                </button>
              </div>

              <div *ngIf="showMilestoneForm" class="add-form mb-3" style="background: #f8fafc; padding: 16px; border-radius: 8px">
                <div class="grid-3" style="gap: 12px">
                  <mat-form-field appearance="outline" style="margin-bottom: -10px">
                    <mat-label>Milestone Name *</mat-label>
                    <input matInput [(ngModel)]="newMilestone.milestoneName" placeholder="e.g. PP1, PPAP Submission">
                  </mat-form-field>

                  <mat-form-field appearance="outline" style="margin-bottom: -10px">
                    <mat-label>Type</mat-label>
                    <mat-select [(ngModel)]="newMilestone.milestoneType">
                      <mat-option value="PP1">PP1</mat-option>
                      <mat-option value="PP2">PP2</mat-option>
                      <mat-option value="SOP">SOP</mat-option>
                      <mat-option value="SOS">SOS</mat-option>
                      <mat-option value="SAMPLE">Sample Submission</mat-option>
                      <mat-option value="PPAP">PPAP Submission</mat-option>
                      <mat-option value="CUSTOM">Custom</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" style="margin-bottom: -10px">
                    <mat-label>Planned Date</mat-label>
                    <input matInput [matDatepicker]="msPicker" [(ngModel)]="newMilestone.plannedDate">
                    <mat-datepicker-toggle matSuffix [for]="msPicker"></mat-datepicker-toggle>
                    <mat-datepicker #msPicker></mat-datepicker>
                  </mat-form-field>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end">
                  <button mat-stroked-button (click)="showMilestoneForm = false">Cancel</button>
                  <button mat-raised-button color="primary" (click)="saveMilestone()"
                          [disabled]="!newMilestone.milestoneName">Save</button>
                </div>
              </div>

              <div class="milestone-timeline">
                <div *ngFor="let ms of milestones()" class="milestone-row">
                  <div class="milestone-dot" [class]="ms.status.toLowerCase()"></div>
                  <div class="milestone-content">
                    <div class="milestone-name">{{ ms.milestoneName }}</div>
                    <div class="milestone-meta">
                      <span class="ms-type-badge">{{ ms.milestoneType }}</span>
                      <span *ngIf="ms.plannedDate">Planned: {{ ms.plannedDate | date:'dd MMM yyyy' }}</span>
                      <span *ngIf="ms.actualDate">Actual: {{ ms.actualDate | date:'dd MMM yyyy' }}</span>
                      <span class="status-chip" [class]="ms.status.toLowerCase()">{{ ms.status }}</span>
                    </div>
                    <div *ngIf="ms.notes" style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px">{{ ms.notes }}</div>
                  </div>
                  <button mat-icon-button color="warn" (click)="deleteMilestone(ms)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
                <div *ngIf="!milestones().length" style="text-align: center; padding: 24px; color: var(--color-text-muted)">
                  No milestones. Click "Add Milestone" to create PP1, PP2, SOP, SOS etc.
                </div>
              </div>
            </div>
          </div>
        </mat-tab>

        <!-- CFT Team Tab -->
        <mat-tab label="CFT Team">
          <div style="padding: 20px 0">
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
                <h3 style="margin: 0; font-size: 1rem">Cross-Functional Team</h3>
                <button mat-raised-button color="primary" (click)="showTeamForm = !showTeamForm">
                  <mat-icon>person_add</mat-icon> Add Member
                </button>
              </div>

              <div *ngIf="showTeamForm" class="add-form mb-3" style="background: #f8fafc; padding: 16px; border-radius: 8px">
                <div class="grid-3" style="gap: 12px">
                  <mat-form-field appearance="outline" style="margin-bottom: -10px">
                    <mat-label>User ID *</mat-label>
                    <input matInput type="number" [(ngModel)]="newMemberId" placeholder="User ID">
                  </mat-form-field>

                  <mat-form-field appearance="outline" style="margin-bottom: -10px">
                    <mat-label>CFT Role *</mat-label>
                    <mat-select [(ngModel)]="newMemberRole">
                      <mat-option value="Program Manager">Program Manager</mat-option>
                      <mat-option value="Design Engineer">Design Engineer</mat-option>
                      <mat-option value="Process Engineer">Process Engineer</mat-option>
                      <mat-option value="Quality Engineer">Quality Engineer</mat-option>
                      <mat-option value="SCM">SCM</mat-option>
                      <mat-option value="Finance">Finance</mat-option>
                      <mat-option value="Plant Head">Plant Head</mat-option>
                      <mat-option value="Other">Other</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <div style="display: flex; align-items: center; gap: 8px; padding: 12px 0">
                    <input type="checkbox" [(ngModel)]="newMemberIsPM" id="isPM">
                    <label for="isPM" style="font-size: 0.875rem; cursor: pointer">Is Program Manager</label>
                  </div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end">
                  <button mat-stroked-button (click)="showTeamForm = false">Cancel</button>
                  <button mat-raised-button color="primary" (click)="addTeamMember()"
                          [disabled]="!newMemberId || !newMemberRole">Add</button>
                </div>
              </div>

              <table class="data-table">
                <thead>
                  <tr><th>User ID</th><th>CFT Role</th><th>Program Manager</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let m of teamMembers()">
                    <td>{{ m.userId }}</td>
                    <td>{{ m.cftRole }}</td>
                    <td><span *ngIf="m.programManager" style="color: #4f46e5; font-weight: 600">✓ PM</span><span *ngIf="!m.programManager">—</span></td>
                    <td>
                      <button mat-icon-button color="warn" (click)="removeTeamMember(m)">
                        <mat-icon>person_remove</mat-icon>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="!teamMembers().length">
                    <td colspan="4" style="text-align: center; padding: 24px; color: var(--color-text-muted)">No team members assigned.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>

        <!-- Customer Reps Tab -->
        <mat-tab label="Customer Reps">
          <div style="padding: 20px 0">
            <div class="card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
                <h3 style="margin: 0; font-size: 1rem">Customer Representatives</h3>
                <button mat-raised-button color="primary" (click)="showRepForm = !showRepForm">
                  <mat-icon>person_add</mat-icon> Add Rep
                </button>
              </div>

              <div *ngIf="showRepForm" class="add-form mb-3" style="background: #f8fafc; padding: 16px; border-radius: 8px">
                <div class="grid-3" style="gap: 12px">
                  <mat-form-field appearance="outline" style="margin-bottom: -10px">
                    <mat-label>Contact *</mat-label>
                    <mat-select [(ngModel)]="newRepContactId">
                      <mat-option *ngFor="let c of availableContacts()" [value]="c.id">
                        {{ c.firstName }} {{ c.lastName }}
                        <span style="color: #999; font-size: 0.8em"> — {{ c.jobTitle || c.email }}</span>
                      </mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-form-field appearance="outline" style="margin-bottom: -10px">
                    <mat-label>Rep Role</mat-label>
                    <input matInput [(ngModel)]="newRepRole" placeholder="e.g. Purchasing Manager">
                  </mat-form-field>

                  <div style="display: flex; align-items: center; gap: 8px; padding: 12px 0">
                    <input type="checkbox" [(ngModel)]="newRepIsPrimary" id="isRepPrimary">
                    <label for="isRepPrimary" style="font-size: 0.875rem; cursor: pointer">Primary Contact</label>
                  </div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end">
                  <button mat-stroked-button (click)="showRepForm = false">Cancel</button>
                  <button mat-raised-button color="primary" (click)="addCustomerRep()"
                          [disabled]="!newRepContactId">Add</button>
                </div>
              </div>

              <table class="data-table">
                <thead>
                  <tr><th>Contact ID</th><th>Role</th><th>Primary</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let rep of customerReps()">
                    <td>{{ rep.contactId }}</td>
                    <td>{{ rep.repRole || '—' }}</td>
                    <td><span *ngIf="rep.primary" style="color: #4f46e5; font-weight: 600">✓ Primary</span><span *ngIf="!rep.primary">—</span></td>
                    <td>
                      <button mat-icon-button color="warn" (click)="removeCustomerRep(rep)">
                        <mat-icon>person_remove</mat-icon>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="!customerReps().length">
                    <td colspan="4" style="text-align: center; padding: 24px; color: var(--color-text-muted)">No customer representatives assigned.</td>
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
      background: #ede9fe; color: #5b21b6;
      padding: 2px 12px; border-radius: 100px;
      font-size: 0.875rem; font-weight: 700;
    }
    .prog-badge {
      background: #fff7ed; color: #c2410c;
      padding: 2px 12px; border-radius: 100px;
      font-size: 0.8rem; font-weight: 700; font-family: monospace;
    }
    .header-stats { display: flex; gap: 24px; border-left: 1px solid var(--color-border); padding-left: 24px; }
    .hstat { text-align: center; }
    .hstat-val { font-size: 1.25rem; font-weight: 700; }
    .hstat-lbl { font-size: 0.75rem; color: var(--color-text-muted); }
    .phase-block { background: white; border-radius: 8px; border: 1px solid var(--color-border); overflow: hidden; }
    .phase-header {
      display: flex; align-items: center; gap: 16px;
      padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid var(--color-border);
    }
    .phase-label { font-weight: 700; font-size: 0.875rem; flex: 1; }
    .phase-progress { font-size: 0.75rem; color: var(--color-text-muted); }
    .milestone-timeline { display: flex; flex-direction: column; gap: 8px; }
    .milestone-row { display: flex; align-items: flex-start; gap: 16px; padding: 12px; border: 1px solid var(--color-border); border-radius: 8px; }
    .milestone-dot {
      width: 12px; height: 12px; border-radius: 50%; margin-top: 4px; flex-shrink: 0;
      &.pending { background: #94a3b8; }
      &.in_progress { background: #3b82f6; }
      &.completed { background: #22c55e; }
      &.delayed { background: #ef4444; }
    }
    .milestone-content { flex: 1; }
    .milestone-name { font-weight: 600; font-size: 0.9rem; }
    .milestone-meta { display: flex; align-items: center; gap: 12px; margin-top: 4px; font-size: 0.8rem; color: var(--color-text-muted); }
    .ms-type-badge { background: #ede9fe; color: #5b21b6; padding: 1px 8px; border-radius: 100px; font-size: 0.7rem; font-weight: 700; }
  `]
})
export class ProjectDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  project = signal<Project | null>(null);
  tasks = signal<ProjectApqpTask[]>([]);
  phases = signal<ApqpPhase[]>([]);
  milestones = signal<ProgramMilestone[]>([]);
  teamMembers = signal<ProgramTeamMember[]>([]);
  customerReps = signal<ProgramCustomerRep[]>([]);
  availableContacts = signal<Contact[]>([]);

  showMilestoneForm = false;
  showTeamForm = false;
  showRepForm = false;

  newMilestone: Partial<ProgramMilestone> = { milestoneType: 'CUSTOM', status: 'PENDING', sequenceNo: 1 };
  newMemberId?: number;
  newMemberRole = '';
  newMemberIsPM = false;
  newRepContactId?: number;
  newRepRole = '';
  newRepIsPrimary = false;

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.api.getProject(id).subscribe(p => {
      this.project.set(p);
      this.api.getContacts(p.customerId).subscribe(c => this.availableContacts.set(c));
    });
    this.api.getApqpPhases().subscribe(phases => this.phases.set(phases));
    this.api.getProjectApqpTasks(id).subscribe(tasks => this.tasks.set(tasks));
    this.api.getProjectMilestones(id).subscribe(ms => this.milestones.set(ms));
    this.api.getProjectTeam(id).subscribe(team => this.teamMembers.set(team));
    this.api.getProjectCustomerReps(id).subscribe(reps => this.customerReps.set(reps));
  }

  getTasksForPhase(phaseId: number): ProjectApqpTask[] {
    return this.tasks().filter(t => t.phaseId === phaseId);
  }
  getPhaseTaskCount(phaseId: number): number { return this.getTasksForPhase(phaseId).length; }
  getCompletedCount(phaseId: number): number { return this.getTasksForPhase(phaseId).filter(t => t.status === 'COMPLETED').length; }
  getProgressPct(phaseId: number): number {
    const total = this.getPhaseTaskCount(phaseId);
    return total ? Math.round((this.getCompletedCount(phaseId) / total) * 100) : 0;
  }

  saveMilestone() {
    const id = this.project()!.id;
    const data = { ...this.newMilestone, sequenceNo: this.milestones().length + 1 };
    this.api.addProjectMilestone(id, data).subscribe(ms => {
      this.milestones.update(list => [...list, ms]);
      this.newMilestone = { milestoneType: 'CUSTOM', status: 'PENDING', sequenceNo: 1 };
      this.showMilestoneForm = false;
    });
  }

  deleteMilestone(ms: ProgramMilestone) {
    this.api.deleteProjectMilestone(this.project()!.id, ms.id!).subscribe(() => {
      this.milestones.update(list => list.filter(m => m.id !== ms.id));
    });
  }

  addTeamMember() {
    const id = this.project()!.id;
    this.api.addProjectTeamMember(id, this.newMemberId!, this.newMemberRole, this.newMemberIsPM)
      .subscribe(member => {
        this.teamMembers.update(list => [...list, member]);
        this.newMemberId = undefined;
        this.newMemberRole = '';
        this.newMemberIsPM = false;
        this.showTeamForm = false;
      });
  }

  removeTeamMember(member: ProgramTeamMember) {
    this.api.removeProjectTeamMember(this.project()!.id, member.userId).subscribe(() => {
      this.teamMembers.update(list => list.filter(m => m.id !== member.id));
    });
  }

  addCustomerRep() {
    const id = this.project()!.id;
    this.api.addProjectCustomerRep(id, this.newRepContactId!, this.newRepRole || undefined, this.newRepIsPrimary)
      .subscribe(rep => {
        this.customerReps.update(list => [...list, rep]);
        this.newRepContactId = undefined;
        this.newRepRole = '';
        this.newRepIsPrimary = false;
        this.showRepForm = false;
      });
  }

  removeCustomerRep(rep: ProgramCustomerRep) {
    this.api.removeProjectCustomerRep(this.project()!.id, rep.contactId).subscribe(() => {
      this.customerReps.update(list => list.filter(r => r.id !== rep.id));
    });
  }
}
