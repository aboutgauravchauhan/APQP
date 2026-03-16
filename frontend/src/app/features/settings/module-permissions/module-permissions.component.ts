import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../../core/services/api.service';
import { ModulePermission } from '../../../core/models';

interface PermMatrix {
  role: string;
  modules: { [module: string]: ModulePermission };
}

@Component({
  selector: 'app-module-permissions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatSlideToggleModule, MatSnackBarModule
  ],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">Module Permissions</div>
        <div class="page-subtitle">Configure role-based access per module</div>
      </div>
    </div>

    <!-- Role Filter -->
    <div class="card mb-4" style="display: flex; gap: 16px; align-items: center">
      <mat-form-field appearance="outline" style="width: 200px; margin-bottom: -20px">
        <mat-label>Filter by Role</mat-label>
        <mat-select [(ngModel)]="selectedRole" (ngModelChange)="filterByRole()">
          <mat-option value="ALL">All Roles</mat-option>
          <mat-option *ngFor="let r of roles()" [value]="r">{{ r }}</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <!-- Permissions Matrix -->
    <div class="card" style="overflow-x: auto">
      <table class="data-table" style="min-width: 800px">
        <thead>
          <tr>
            <th>Role</th>
            <th>Module</th>
            <th style="text-align: center">View</th>
            <th style="text-align: center">Create</th>
            <th style="text-align: center">Edit</th>
            <th style="text-align: center">Delete</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let perm of filteredPermissions()">
            <td>
              <span class="role-badge" [class]="perm.roleCode.toLowerCase().replace('_', '-')">
                {{ perm.roleCode }}
              </span>
            </td>
            <td>
              <mat-icon style="font-size: 18px; vertical-align: middle; margin-right: 6px; color: var(--color-text-muted)">
                {{ getModuleIcon(perm.module) }}
              </mat-icon>
              {{ perm.module }}
            </td>
            <td style="text-align: center">
              <mat-slide-toggle [checked]="perm.canView" (change)="toggle(perm, 'canView', $event.checked)"></mat-slide-toggle>
            </td>
            <td style="text-align: center">
              <mat-slide-toggle [checked]="perm.canCreate" (change)="toggle(perm, 'canCreate', $event.checked)"></mat-slide-toggle>
            </td>
            <td style="text-align: center">
              <mat-slide-toggle [checked]="perm.canEdit" (change)="toggle(perm, 'canEdit', $event.checked)"></mat-slide-toggle>
            </td>
            <td style="text-align: center">
              <mat-slide-toggle [checked]="perm.canDelete" (change)="toggle(perm, 'canDelete', $event.checked)"></mat-slide-toggle>
            </td>
          </tr>
          <tr *ngIf="!filteredPermissions().length">
            <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-text-muted)">
              No permissions configured.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .role-badge {
      padding: 2px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 700;
      background: #e0e7ff; color: #3730a3;
    }
  `]
})
export class ModulePermissionsComponent implements OnInit {
  private api = inject(ApiService);
  private snack = inject(MatSnackBar);

  permissions = signal<ModulePermission[]>([]);
  roles = signal<string[]>([]);
  selectedRole = 'ALL';

  ngOnInit() {
    this.api.getModulePermissions().subscribe(list => {
      this.permissions.set(list);
      const uniqueRoles = [...new Set(list.map(p => p.roleCode))];
      this.roles.set(uniqueRoles);
    });
  }

  filteredPermissions(): ModulePermission[] {
    if (this.selectedRole === 'ALL') return this.permissions();
    return this.permissions().filter(p => p.roleCode === this.selectedRole);
  }

  filterByRole() {
    // Signal-based filter via filteredPermissions()
  }

  toggle(perm: ModulePermission, field: 'canView' | 'canCreate' | 'canEdit' | 'canDelete', value: boolean) {
    const updated = { ...perm, [field]: value };
    this.api.updateModulePermission(perm.id, updated).subscribe(saved => {
      this.permissions.update(list => list.map(p => p.id === saved.id ? saved : p));
      this.snack.open('Permission updated', '', { duration: 2000 });
    });
  }

  getModuleIcon(module: string): string {
    const icons: Record<string, string> = {
      PROJECTS: 'folder_open', BOM: 'account_tree', APQP: 'timeline',
      ECN: 'change_circle', PPAP: 'verified', VENDORS: 'factory',
      CUSTOMERS: 'business', EMPLOYEES: 'people', CONTACTS: 'contacts',
      SETTINGS: 'settings'
    };
    return icons[module] || 'square';
  }
}
