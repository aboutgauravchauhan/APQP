import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ApiService } from '../../../core/services/api.service';
import { BomTreeNode, Part } from '../../../core/models';

@Component({
  selector: 'app-bom-studio',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTabsModule, MatTooltipModule],
  template: `
    <div class="page-header">
      <div>
        <div class="page-title">BOM Studio</div>
        <div class="page-subtitle">Assembly → Sub Assembly → Part → Process → Tooling → Vendor</div>
      </div>
    </div>

    <div class="bom-layout">
      <!-- Left Panel: Product Tree -->
      <div class="bom-left-panel card">
        <div class="panel-title">
          <mat-icon>account_tree</mat-icon> Product Structure
        </div>

        <div *ngIf="!bomTree()" class="empty-tree">
          <mat-icon>folder_open</mat-icon>
          <p>No BOM loaded</p>
          <p style="font-size: 0.75rem">Select a project to load the BOM tree</p>
        </div>

        <div *ngIf="bomTree()" class="tree-container">
          <ng-container *ngTemplateOutlet="treeNode; context: { node: bomTree(), depth: 0 }"></ng-container>
        </div>

        <ng-template #treeNode let-node="node" let-depth="depth">
          <div class="bom-tree-node"
               [style.paddingLeft.px]="16 + depth * 20"
               [class.selected]="selectedNode()?.partId === node.partId"
               (click)="selectNode(node)">
            <mat-icon class="node-icon" [style.color]="getPartColor(node.partType)">
              {{ getPartIcon(node.partType) }}
            </mat-icon>
            <div style="flex: 1; min-width: 0">
              <div class="node-label">{{ node.partNo }}</div>
              <div style="font-size: 0.7rem; color: var(--color-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis">
                {{ node.partName }}
              </div>
            </div>
            <span class="node-meta">Qty: {{ node.quantity }}</span>
          </div>
          <ng-container *ngFor="let child of node.children">
            <ng-container *ngTemplateOutlet="treeNode; context: { node: child, depth: depth + 1 }"></ng-container>
          </ng-container>
        </ng-template>
      </div>

      <!-- Center Panel: Component Workspace -->
      <div class="bom-center-panel">
        <div *ngIf="!selectedNode()" class="empty-workspace card">
          <mat-icon style="font-size: 64px; color: var(--color-border)">touch_app</mat-icon>
          <p>Select a part from the tree to view details</p>
        </div>

        <ng-container *ngIf="selectedNode()">
          <div class="card mb-4">
            <div class="flex items-center justify-between mb-3">
              <div>
                <div class="flex items-center gap-2">
                  <span style="font-size: 1rem; font-weight: 700">{{ selectedNode()!.partNo }}</span>
                  <span class="status-chip active">{{ selectedNode()!.partType }}</span>
                  <span class="status-chip draft">{{ selectedNode()!.sourcingType }}</span>
                  <span style="font-size: 0.75rem; font-weight: 600; color: #7c3aed">
                    Rev {{ selectedNode()!.drawingRevision }}
                  </span>
                </div>
                <div style="font-size: 1rem; margin-top: 4px">{{ selectedNode()!.partName }}</div>
              </div>
              <div class="flex gap-2">
                <button mat-stroked-button>
                  <mat-icon>edit</mat-icon> Edit Part
                </button>
                <button mat-stroked-button color="warn">
                  <mat-icon>change_circle</mat-icon> Raise ECN
                </button>
              </div>
            </div>

            <div class="grid-4">
              <div class="detail-item">
                <div class="di-label">Material</div>
                <div class="di-val">{{ selectedNode()!.materialSpec || '—' }}</div>
              </div>
              <div class="detail-item">
                <div class="di-label">Weight</div>
                <div class="di-val">{{ selectedNode()!.weightKg ? (selectedNode()!.weightKg + ' kg') : '—' }}</div>
              </div>
              <div class="detail-item">
                <div class="di-label">UOM</div>
                <div class="di-val">{{ selectedNode()!.uom }}</div>
              </div>
              <div class="detail-item">
                <div class="di-label">Children</div>
                <div class="di-val">{{ selectedNode()!.children.length }} items</div>
              </div>
            </div>
          </div>

          <!-- Detail Tabs -->
          <div class="card">
            <mat-tab-group animationDuration="0">
              <mat-tab label="Child Items">
                <div style="padding: 16px 0">
                  <table class="data-table" *ngIf="selectedNode()!.children.length; else noChildren">
                    <thead>
                      <tr>
                        <th>Find No</th>
                        <th>Part No</th>
                        <th>Part Name</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Source</th>
                        <th>Rev</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let child of selectedNode()!.children"
                          (click)="selectNode(child)" style="cursor: pointer">
                        <td>{{ child.findNo || '—' }}</td>
                        <td style="font-weight: 600">{{ child.partNo }}</td>
                        <td>{{ child.partName }}</td>
                        <td><span class="status-chip draft">{{ child.partType }}</span></td>
                        <td>{{ child.quantity }}</td>
                        <td>{{ child.sourcingType }}</td>
                        <td style="color: #7c3aed; font-weight: 600">{{ child.drawingRevision }}</td>
                      </tr>
                    </tbody>
                  </table>
                  <ng-template #noChildren>
                    <p style="color: var(--color-text-muted); text-align: center; padding: 24px">
                      No child items. This is a leaf component.
                    </p>
                  </ng-template>
                </div>
              </mat-tab>

              <mat-tab label="Process Routing">
                <div style="padding: 16px 0; color: var(--color-text-muted); text-align: center">
                  Process routing will be loaded here
                </div>
              </mat-tab>

              <mat-tab label="Tooling">
                <div style="padding: 16px 0; color: var(--color-text-muted); text-align: center">
                  Tooling items linked to this part
                </div>
              </mat-tab>

              <mat-tab label="Vendors">
                <div style="padding: 16px 0; color: var(--color-text-muted); text-align: center">
                  Vendor assignments for this part
                </div>
              </mat-tab>

              <mat-tab label="Quality">
                <div style="padding: 16px 0; color: var(--color-text-muted); text-align: center">
                  PFMEA, Control Plan, MSA links
                </div>
              </mat-tab>

              <mat-tab label="ECN History">
                <div style="padding: 16px 0; color: var(--color-text-muted); text-align: center">
                  Engineering change history
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </ng-container>
      </div>

      <!-- Right Panel: Impact Summary -->
      <div class="bom-right-panel card" *ngIf="selectedNode()">
        <div class="panel-title">
          <mat-icon>insights</mat-icon> Impact Panel
        </div>

        <div class="impact-section">
          <div class="impact-header">PPAP Status</div>
          <div class="impact-status amber">Pending submission</div>
        </div>

        <div class="impact-section">
          <div class="impact-header">Open ECNs</div>
          <div class="impact-status amber">2 active changes</div>
        </div>

        <div class="impact-section">
          <div class="impact-header">Tooling Status</div>
          <div class="impact-status green">T1 trial complete</div>
        </div>

        <div class="impact-section">
          <div class="impact-header">Vendor Risk</div>
          <div class="impact-status green">Approved vendor</div>
        </div>

        <div class="impact-section">
          <div class="impact-header">APQP Progress</div>
          <div class="progress-bar" style="margin-top: 8px">
            <div class="progress-fill blue" style="width: 65%"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px">65% complete</div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bom-layout {
      display: grid;
      grid-template-columns: 280px 1fr 220px;
      gap: 16px;
      height: calc(100vh - 160px);
    }

    .bom-left-panel, .bom-right-panel {
      overflow-y: auto;
      padding: 0;
    }

    .bom-center-panel { overflow-y: auto; }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 16px;
      font-size: 0.875rem;
      font-weight: 700;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      background: white;
      z-index: 1;
    }

    .tree-container { padding: 8px 0; }

    .empty-tree, .empty-workspace {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: var(--color-text-muted);
      text-align: center;

      mat-icon { font-size: 48px; margin-bottom: 12px; }
      p { margin: 4px 0; }
    }

    .detail-item { padding: 8px; }
    .di-label { font-size: 0.7rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; }
    .di-val { font-size: 0.875rem; font-weight: 500; margin-top: 2px; }

    .impact-section {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border);
    }

    .impact-header {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--color-text-muted);
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .impact-status {
      font-size: 0.875rem;
      font-weight: 600;
      &.green { color: var(--rag-green); }
      &.amber { color: var(--rag-amber); }
      &.red { color: var(--rag-red); }
    }
  `]
})
export class BomStudioComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  bomTree = signal<BomTreeNode | null>(null);
  selectedNode = signal<BomTreeNode | null>(null);

  ngOnInit() {
    const bomId = this.route.snapshot.queryParams['bomId'];
    if (bomId) {
      this.api.getBomTree(+bomId).subscribe(tree => this.bomTree.set(tree));
    }
  }

  selectNode(node: BomTreeNode) {
    this.selectedNode.set(node);
  }

  getPartIcon(type: string): string {
    const icons: Record<string, string> = {
      'ASSEMBLY': 'inventory_2',
      'SUB_ASSEMBLY': 'widgets',
      'COMPONENT': 'precision_manufacturing',
      'RAW_MATERIAL': 'layers',
      'BOUGHT_OUT': 'shopping_cart',
      'SERVICE': 'build'
    };
    return icons[type] || 'circle';
  }

  getPartColor(type: string): string {
    const colors: Record<string, string> = {
      'ASSEMBLY': '#4f46e5',
      'SUB_ASSEMBLY': '#0891b2',
      'COMPONENT': '#059669',
      'RAW_MATERIAL': '#d97706',
      'BOUGHT_OUT': '#dc2626',
      'SERVICE': '#7c3aed'
    };
    return colors[type] || '#64748b';
  }
}
