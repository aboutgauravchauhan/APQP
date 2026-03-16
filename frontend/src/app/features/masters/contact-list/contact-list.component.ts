import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../core/services/api.service';
import { Contact, Customer, Vendor } from '../../../core/models';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatInputModule,
    MatFormFieldModule, MatSelectModule
  ],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">Contact Master</div>
        <div class="page-subtitle">All contacts linked to Customers or Vendors</div>
      </div>
      <button mat-raised-button color="primary" (click)="showForm = true">
        <mat-icon>add</mat-icon> New Contact
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4" style="display: flex; gap: 16px; align-items: center">
      <mat-form-field appearance="outline" style="width: 300px; margin-bottom: -20px">
        <mat-label>Search</mat-label>
        <input matInput [(ngModel)]="searchText" placeholder="Name, email...">
      </mat-form-field>

      <mat-form-field appearance="outline" style="width: 180px; margin-bottom: -20px">
        <mat-label>Filter by Type</mat-label>
        <mat-select [(ngModel)]="typeFilter">
          <mat-option value="ALL">All</mat-option>
          <mat-option value="CUSTOMER">Customer Contacts</mat-option>
          <mat-option value="VENDOR">Vendor Contacts</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    <!-- Contact Form -->
    <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
      <div class="modal-box" (click)="$event.stopPropagation()">
        <h3>{{ editId ? 'Edit Contact' : 'New Contact' }}</h3>
        <form [formGroup]="form" (ngSubmit)="save()">
          <div class="grid-2" style="gap: 12px">
            <mat-form-field appearance="outline">
              <mat-label>First Name *</mat-label>
              <input matInput formControlName="firstName">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Last Name</mat-label>
              <input matInput formControlName="lastName">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Phone</mat-label>
              <input matInput formControlName="phone">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Job Title</mat-label>
              <input matInput formControlName="jobTitle">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Department</mat-label>
              <input matInput formControlName="department">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Link to Customer</mat-label>
              <mat-select formControlName="customerId">
                <mat-option [value]="null">— None —</mat-option>
                <mat-option *ngFor="let c of customers()" [value]="c.id">{{ c.customerName }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Link to Vendor</mat-label>
              <mat-select formControlName="vendorId">
                <mat-option [value]="null">— None —</mat-option>
                <mat-option *ngFor="let v of vendors()" [value]="v.id">{{ v.vendorName }}</mat-option>
              </mat-select>
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

    <!-- Contacts Table -->
    <div class="card">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Job Title</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Linked To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let ct of filteredContacts()">
            <td style="font-weight: 500">{{ ct.firstName }} {{ ct.lastName }}</td>
            <td>{{ ct.jobTitle || '—' }}</td>
            <td>{{ ct.email || '—' }}</td>
            <td>{{ ct.phone || '—' }}</td>
            <td>
              <span *ngIf="ct.customerId" style="background: #ede9fe; color: #5b21b6; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem">
                Customer #{{ ct.customerId }}
              </span>
              <span *ngIf="ct.vendorId" style="background: #fef9c3; color: #713f12; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem">
                Vendor #{{ ct.vendorId }}
              </span>
            </td>
            <td>
              <button mat-icon-button (click)="openForm(ct)" matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="delete(ct)" matTooltip="Delete">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </tr>
          <tr *ngIf="!filteredContacts().length">
            <td colspan="6" style="text-align: center; padding: 40px; color: var(--color-text-muted)">No contacts found.</td>
          </tr>
        </tbody>
      </table>
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
export class ContactListComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  contacts = signal<Contact[]>([]);
  customers = signal<Customer[]>([]);
  vendors = signal<Vendor[]>([]);

  searchText = '';
  typeFilter = 'ALL';
  showForm = false;
  editId: number | null = null;

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: [''],
    email: [''],
    phone: [''],
    jobTitle: [''],
    department: [''],
    customerId: [null as number | null],
    vendorId: [null as number | null]
  });

  ngOnInit() {
    this.api.getContacts().subscribe(list => this.contacts.set(list));
    this.api.getActiveCustomers().subscribe(list => this.customers.set(list));
    this.api.getVendors().subscribe(res => this.vendors.set(res.content));
  }

  filteredContacts(): Contact[] {
    return this.contacts().filter(ct => {
      const q = this.searchText.toLowerCase();
      const matchSearch = !q ||
        (ct.firstName + ' ' + (ct.lastName || '')).toLowerCase().includes(q) ||
        (ct.email || '').toLowerCase().includes(q);
      const matchType =
        this.typeFilter === 'ALL' ||
        (this.typeFilter === 'CUSTOMER' && !!ct.customerId) ||
        (this.typeFilter === 'VENDOR' && !!ct.vendorId);
      return matchSearch && matchType;
    });
  }

  openForm(contact?: Contact) {
    this.editId = contact?.id || null;
    this.form.reset();
    if (contact) this.form.patchValue(contact as any);
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editId = null;
  }

  save() {
    if (this.form.invalid) return;
    const data = this.form.value as Partial<Contact>;
    const obs = this.editId
      ? this.api.updateContact(this.editId, data)
      : this.api.createContact(data);
    obs.subscribe(ct => {
      if (this.editId) {
        this.contacts.update(list => list.map(c => c.id === ct.id ? ct : c));
      } else {
        this.contacts.update(list => [...list, ct]);
      }
      this.closeForm();
    });
  }

  delete(ct: Contact) {
    if (!confirm(`Delete ${ct.firstName}?`)) return;
    this.api.deleteContact(ct.id).subscribe(() => {
      this.contacts.update(list => list.filter(c => c.id !== ct.id));
    });
  }
}
