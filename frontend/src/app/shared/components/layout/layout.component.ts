import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="logo" *ngIf="!sidebarCollapsed()">
            <span class="logo-icon">⚙</span>
            <span class="logo-text">APQP<span class="logo-accent">Pro</span></span>
          </div>
          <button class="collapse-btn" (click)="toggleSidebar()" matTooltip="Toggle sidebar">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [matTooltip]="sidebarCollapsed() ? item.label : ''"
             matTooltipPosition="right">
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
            <span class="nav-label" *ngIf="!sidebarCollapsed()">{{ item.label }}</span>
            <span class="nav-badge" *ngIf="item.badge && !sidebarCollapsed()">{{ item.badge }}</span>
          </a>
        </nav>

        <div class="sidebar-footer" *ngIf="!sidebarCollapsed()">
          <div class="user-info">
            <div class="user-avatar">{{ initials() }}</div>
            <div class="user-details">
              <div class="user-name">{{ auth.currentUser()?.fullName }}</div>
              <div class="user-role">{{ auth.currentUser()?.roleCode }}</div>
            </div>
          </div>
          <button class="logout-btn" (click)="auth.logout()" matTooltip="Logout">
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Top Header -->
        <header class="app-header">
          <div class="header-left">
            <h1 class="header-title">APQP Management System</h1>
            <span class="header-subtitle">Automotive Product Quality Planning</span>
          </div>
          <div class="header-right">
            <button class="icon-btn" matTooltip="Notifications">
              <mat-icon>notifications</mat-icon>
            </button>
            <button class="icon-btn" matTooltip="Settings">
              <mat-icon>settings</mat-icon>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      background: #1e1b4b;
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
      flex-shrink: 0;
      overflow: hidden;

      &.collapsed { width: 64px; }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      min-height: var(--header-height);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .logo-icon { font-size: 1.5rem; }
    .logo-accent { color: #f97316; }

    .collapse-btn, .logout-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.7);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      &:hover { color: white; background: rgba(255,255,255,0.1); }
    }

    .sidebar-nav {
      flex: 1;
      padding: 12px 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: all 0.15s;
      border-left: 3px solid transparent;

      &:hover { background: rgba(255,255,255,0.08); color: white; }
      &.active { background: rgba(255,255,255,0.12); color: white; border-left-color: #f97316; }
    }

    .nav-icon { font-size: 20px; flex-shrink: 0; }
    .nav-label { font-size: 0.875rem; font-weight: 500; flex: 1; }
    .nav-badge {
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 100px;
    }

    .sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-info { display: flex; align-items: center; gap: 10px; flex: 1; overflow: hidden; }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #4f46e5;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role { font-size: 0.7rem; color: rgba(255,255,255,0.5); }

    .app-header {
      height: var(--header-height);
      background: white;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      flex-shrink: 0;
    }

    .header-title { font-size: 1rem; font-weight: 700; margin: 0; }
    .header-subtitle { font-size: 0.75rem; color: var(--color-text-muted); margin-left: 8px; }

    .header-right { display: flex; gap: 8px; }

    .icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      &:hover { background: var(--color-bg); color: var(--color-text); }
    }
  `]
})
export class LayoutComponent {
  auth = inject(AuthService);
  sidebarCollapsed = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'dashboard',          route: '/dashboard' },
    { label: 'Projects',    icon: 'folder_open',         route: '/projects' },
    { label: 'BOM Studio',  icon: 'account_tree',        route: '/bom' },
    { label: 'APQP',        icon: 'timeline',            route: '/apqp' },
    { label: 'ECN',         icon: 'change_circle',       route: '/ecn' },
    { label: 'PPAP',        icon: 'verified',            route: '/ppap' },
    { label: 'Vendors',     icon: 'factory',             route: '/vendors' },
  ];

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  initials(): string {
    const name = this.auth.currentUser()?.fullName || '';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
}
