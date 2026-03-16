import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-left">
        <div class="brand">
          <span class="brand-icon">⚙</span>
          <h1>APQP<span class="brand-accent">Pro</span></h1>
        </div>
        <p class="tagline">Advanced Product Quality Planning</p>
        <p class="desc">
          Complete program management platform for automotive component development.
          Manage BOM, APQP workflows, ECN, PPAP, and vendor qualification in one place.
        </p>
        <div class="feature-list">
          <div class="feature" *ngFor="let f of features">
            <span class="feature-icon">{{ f.icon }}</span>
            <span>{{ f.label }}</span>
          </div>
        </div>
      </div>

      <div class="login-right">
        <div class="login-card">
          <h2>Sign In</h2>
          <p class="login-sub">Enter your credentials to access the system</p>

          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="email" placeholder="you@company.com">
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput [type]="showPassword() ? 'text' : 'password'" formControlName="password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button" (click)="showPassword.update(v => !v)">
                <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </mat-form-field>

            <div class="error-msg" *ngIf="error()">
              <mat-icon>error</mat-icon> {{ error() }}
            </div>

            <button mat-raised-button color="primary" type="submit"
                    class="submit-btn" [disabled]="loading() || form.invalid">
              <mat-spinner diameter="20" *ngIf="loading()"></mat-spinner>
              <span *ngIf="!loading()">Sign In</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      height: 100vh;
    }

    .login-left {
      flex: 1;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e40af 100%);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 60px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;

      h1 { font-size: 2rem; font-weight: 800; margin: 0; }
    }

    .brand-icon { font-size: 2.5rem; }
    .brand-accent { color: #f97316; }

    .tagline {
      font-size: 1rem;
      color: rgba(255,255,255,0.7);
      margin-bottom: 24px;
    }

    .desc {
      font-size: 0.9rem;
      line-height: 1.7;
      color: rgba(255,255,255,0.8);
      max-width: 420px;
      margin-bottom: 32px;
    }

    .feature-list { display: flex; flex-direction: column; gap: 12px; }

    .feature {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.875rem;
      color: rgba(255,255,255,0.85);

      .feature-icon { font-size: 1.2rem; }
    }

    .login-right {
      width: 480px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 400px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);

      h2 { font-size: 1.5rem; font-weight: 700; margin: 0 0 4px; }
    }

    .login-sub { color: #64748b; margin-bottom: 28px; font-size: 0.875rem; }

    .full-width { width: 100%; margin-bottom: 16px; }

    .error-msg {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #dc2626;
      font-size: 0.875rem;
      margin-bottom: 16px;
    }

    .submit-btn {
      width: 100%;
      padding: 12px;
      font-size: 1rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right { width: 100%; }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  error = signal('');
  showPassword = signal(false);

  features = [
    { icon: '📋', label: 'APQP Phase Tracking & Gantt View' },
    { icon: '🏗️', label: 'BOM Studio — Assembly to Component' },
    { icon: '🔄', label: 'ECN Impact Engine — Auto Propagation' },
    { icon: '✅', label: 'PPAP Cockpit — All 18 Elements' },
    { icon: '🏭', label: 'Vendor Qualification & Scorecard' },
  ];

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error.set(err.error?.message || 'Invalid credentials. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
