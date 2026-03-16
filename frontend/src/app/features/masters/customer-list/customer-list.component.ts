import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ApiService } from '../../../core/services/api.service';
import { Customer, Contact } from '../../../core/models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule,
    MatSelectModule, MatDialogModule, MatTabsModule
  ],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">Customer Master</div>
        <div class="page-subtitle">{{ customers().length }} customers</div>
      </div>
      <button mat-raised-button color="primary" (click)="openForm()">
        <mat-icon>add</mat-icon> New Customer
      </button>
    </div>

    <!-- Search -->
    <div class="card mb-4">
      <mat-form-field appearance="outline" style="width: 360px; margin-bottom: -20px">
        <mat-label>Search customers</mat-label>
        <input matInput [(ngModel)]="searchText" placeholder="Name or code...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>
    </div>

    <!-- Customer Form Modal overlay -->
    <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3>{{ editId ? 'Edit Customer' : 'New Customer' }}</h3>
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="grid-2" style="gap: 12px">
            <mat-form-field appearance="outline">
              <mat-label>Customer Name *</mat-label>
              <input matInput formControlName="customerName">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Customer Code</mat-label>
              <input matInput formControlName="customerCode" placeholder="Auto-generated if blank">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>OEM Type</mat-label>
              <mat-select formControlName="oemType">
                <mat-option value="OEM">OEM</mat-option>
                <mat-option value="TIER1">Tier-1</mat-option>
                <mat-option value="TIER2">Tier-2</mat-option>
                <mat-option value="OTHER">Other</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Country</mat-label>
              <input matInput formControlName="country">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Location / City</mat-label>
              <input matInput formControlName="location">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Primary Contact Name</mat-label>
              <input matInput formControlName="contactPerson">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contact Email</mat-label>
              <input matInput formControlName="contactEmail" type="email">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Contact Phone</mat-label>
              <input matInput formControlName="contactPhone">
            </mat-form-field>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px">
            <button mat-stroked-button type="button" (click)="closeForm()">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
              {{ editId ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>OEM Type</th>
            <th>Country</th>
            <th>Contact</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of filteredCustomers()">
            <td><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px">{{ c.customerCode }}</code></td>
            <td style="font-weight: 500">{{ c.customerName }}</td>
            <td>{{ c.oemType || '—' }}</td>
            <td>{{ c.country || '—' }}</td>
            <td>
              <div>{{ c.contactPerson || '—' }}</div>
              <div style="font-size: 0.75rem; color: var(--color-text-muted)">{{ c.contactEmail }}</div>
            </td>
            <td>
              <span class="status-chip" [class]="c.active ? 'active' : 'inactive'">
                {{ c.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td>
              <button mat-icon-button (click)="openViewContacts(c)" matTooltip="View Contacts">
                <mat-icon>contacts</mat-icon>
              </button>
              <button mat-icon-button (click)="openForm(c)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="delete(c)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </tr>
          <tr *ngIf="!filteredCustomers().length">
            <td colspan="7" style="text-align: center; padding: 40px; color: var(--color-text-muted)">
              No customers found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Contacts Panel -->
    <div class="modal-overlay" *ngIf="viewContactsCustomer()" (click)="viewContactsCustomer.set(null)">
      <div class="modal-box" style="width: 700px" (click)="$event.stopPropagation()">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px">
          <h3 style="margin: 0">Contacts — {{ viewContactsCustomer()!.customerName }}</h3>
          <div style="display: flex; gap: 8px">
            <button mat-raised-button color="primary" (click)="openAddContact()">
              <mat-icon>add</mat-icon> Add Contact
            </button>
            <button mat-icon-button (click)="viewContactsCustomer.set(null)"><mat-icon>close</mat-icon></button>
          </div>
        </div>

        <!-- Add Contact inline form -->
        <div *ngIf="showContactForm" style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px">
          <div class="grid-3" style="gap: 12px">
            <mat-form-field appearance="outline" style="margin-bottom: -10px">
              <mat-label>First Name *</mat-label>
              <input matInput [(ngModel)]="newContact.firstName">
            </mat-form-field>
            <mat-form-field appearance="outline" style="margin-bottom: -10px">
              <mat-label>Last Name</mat-label>
              <input matInput [(ngModel)]="newContact.lastName">
            </mat-form-field>
            <mat-form-field appearance="outline" style="margin-bottom: -10px">
              <mat-label>Job Title</mat-label>
              <input matInput [(ngModel)]="newContact.jobTitle">
            </mat-form-field>
            <mat-form-field appearance="outline" style="margin-bottom: -10px">
              <mat-label>Email</mat-label>
              <input matInput type="email" [(ngModel)]="newContact.email">
            </mat-form-field>
            <mat-form-field appearance="outline" style="margin-bottom: -10px">
              <mat-label>Phone</mat-label>
              <input matInput [(ngModel)]="newContact.phone">
            </mat-form-field>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 12px; justify-content: flex-end">
            <button mat-stroked-button (click)="showContactForm = false">Cancel</button>
            <button mat-raised-button color="primary" (click)="saveContact()" [disabled]="!newContact.firstName">Save</button>
          </div>
        </div>

        <table class="data-table">
          <thead>
            <tr><th>Name</th><th>Job Title</th><th>Email</th><th>Phone</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let ct of contacts()">
              <td style="font-weight: 500">{{ ct.firstName }} {{ ct.lastName }}</td>
              <td>{{ ct.jobTitle || '—' }}</td>
              <td>{{ ct.email || '—' }}</td>
              <td>{{ ct.phone || '—' }}</td>
              <td>
                <button mat-icon-button color="warn" (click)="deleteContact(ct)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </tr>
            <tr *ngIf="!contacts().length">
              <td colspan="5" style="text-align: center; padding: 24px; color: var(--color-text-muted)">No contacts.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.4);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-box {
      background: white; border-radius: 12px; padding: 24px;
      width: 600px; max-height: 90vh; overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }
    mat-form-field { width: 100%; }
  `]
})
export class CustomerListComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  customers = signal<Customer[]>([]);
  contacts = signal<Contact[]>([]);
  viewContactsCustomer = signal<Customer | null>(null);

  searchText = '';
  showForm = false;
  showContactForm = false;
  editId: number | null = null;

  newContact: Partial<Contact> = {};

  form = this.fb.group({
    customerName: ['', Validators.required],
    customerCode: [''],
    oemType: [''],
    country: [''],
    location: [''],
    contactPerson: [''],
    contactEmail: [''],
    contactPhone: ['']
  });

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.api.getCustomers().subscribe(res => this.customers.set(res.content));
  }

  filteredCustomers(): Customer[] {
    if (!this.searchText) return this.customers();
    const q = this.searchText.toLowerCase();
    return this.customers().filter(c =>
      c.customerName.toLowerCase().includes(q) || c.customerCode.toLowerCase().includes(q)
    );
  }

  openForm(customer?: Customer) {
    this.editId = customer?.id || null;
    this.form.reset({ oemType: '', country: '', location: '', contactPerson: '', contactEmail: '', contactPhone: '', customerCode: '', customerName: '' });
    if (customer) {
      this.form.patchValue(customer as any);
    }
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editId = null;
  }

  save() {
    if (this.form.invalid) return;
    const data = this.form.value as Partial<Customer>;
    const obs = this.editId
      ? this.api.updateCustomer(this.editId, data)
      : this.api.createCustomer(data);
    obs.subscribe(() => {
      this.loadCustomers();
      this.closeForm();
    });
  }

  delete(c: Customer) {
    if (!confirm(`Delete ${c.customerName}?`)) return;
    this.api.deleteCustomer(c.id).subscribe(() => this.loadCustomers());
  }

  openViewContacts(c: Customer) {
    this.viewContactsCustomer.set(c);
    this.api.getContacts(c.id).subscribe(list => this.contacts.set(list));
  }

  openAddContact() {
    this.newContact = { customerId: this.viewContactsCustomer()!.id };
    this.showContactForm = true;
  }

  saveContact() {
    this.api.createContact(this.newContact).subscribe(ct => {
      this.contacts.update(list => [...list, ct]);
      this.newContact = {};
      this.showContactForm = false;
    });
  }

  deleteContact(ct: Contact) {
    this.api.deleteContact(ct.id).subscribe(() => {
      this.contacts.update(list => list.filter(c => c.id !== ct.id));
    });
  }
}
