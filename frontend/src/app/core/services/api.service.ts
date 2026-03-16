import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Project, Part, BomTreeNode, ApqpPhase, ProjectApqpTask,
  ChangeRequest, EcnImpactedObject, PpapPackage, Vendor,
  DashboardSummary, PageResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ---- Auth ----
  login(email: string, password: string) {
    return this.http.post<any>(`${this.base}/auth/login`, { email, password });
  }

  // ---- Dashboard ----
  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard/summary`);
  }

  // ---- Projects ----
  getProjects(page = 0, size = 20): Observable<PageResponse<Project>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    return this.http.get<PageResponse<Project>>(`${this.base}/projects`, { params });
  }

  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.base}/projects/${id}`);
  }

  createProject(data: Partial<Project>): Observable<Project> {
    return this.http.post<Project>(`${this.base}/projects`, data);
  }

  updateProject(id: number, data: Partial<Project>): Observable<Project> {
    return this.http.put<Project>(`${this.base}/projects/${id}`, data);
  }

  updateProjectStatus(id: number, status: string): Observable<Project> {
    return this.http.patch<Project>(`${this.base}/projects/${id}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }

  // ---- Parts & BOM ----
  getProjectParts(projectId: number): Observable<Part[]> {
    return this.http.get<Part[]>(`${this.base}/projects/${projectId}/parts`);
  }

  createPart(projectId: number, part: Partial<Part>): Observable<Part> {
    return this.http.post<Part>(`${this.base}/projects/${projectId}/parts`, part);
  }

  getProjectBoms(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/projects/${projectId}/bom`);
  }

  createBom(projectId: number, topPartId: number): Observable<any> {
    return this.http.post<any>(`${this.base}/projects/${projectId}/bom`, null, {
      params: new HttpParams().set('topPartId', topPartId)
    });
  }

  getBomTree(bomId: number): Observable<BomTreeNode> {
    return this.http.get<BomTreeNode>(`${this.base}/bom/${bomId}/tree`);
  }

  addBomLine(bomId: number, parentPartId: number, childPartId: number, quantity: number) {
    return this.http.post<any>(`${this.base}/bom/${bomId}/lines`, null, {
      params: new HttpParams()
        .set('parentPartId', parentPartId)
        .set('childPartId', childPartId)
        .set('quantity', quantity)
    });
  }

  getWhereUsed(partId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/parts/${partId}/where-used`);
  }

  // ---- APQP ----
  getApqpPhases(): Observable<ApqpPhase[]> {
    return this.http.get<ApqpPhase[]>(`${this.base}/apqp/phases`);
  }

  getProjectApqpTasks(projectId: number): Observable<ProjectApqpTask[]> {
    return this.http.get<ProjectApqpTask[]>(`${this.base}/projects/${projectId}/apqp/tasks`);
  }

  getApqpProgress(projectId: number): Observable<Record<number, any>> {
    return this.http.get<Record<number, any>>(`${this.base}/projects/${projectId}/apqp/progress`);
  }

  updateApqpTask(taskId: number, data: Partial<ProjectApqpTask>): Observable<ProjectApqpTask> {
    return this.http.put<ProjectApqpTask>(`${this.base}/apqp/tasks/${taskId}`, data);
  }

  // ---- ECN ----
  createEcn(data: Partial<ChangeRequest>): Observable<ChangeRequest> {
    return this.http.post<ChangeRequest>(`${this.base}/ecn`, data);
  }

  getProjectEcns(projectId: number): Observable<ChangeRequest[]> {
    return this.http.get<ChangeRequest[]>(`${this.base}/ecn/project/${projectId}`);
  }

  getEcn(id: number): Observable<ChangeRequest> {
    return this.http.get<ChangeRequest>(`${this.base}/ecn/${id}`);
  }

  submitEcn(id: number): Observable<ChangeRequest> {
    return this.http.post<ChangeRequest>(`${this.base}/ecn/${id}/submit`, null);
  }

  approveEcn(id: number): Observable<ChangeRequest> {
    return this.http.post<ChangeRequest>(`${this.base}/ecn/${id}/approve`, null);
  }

  rejectEcn(id: number, reason: string): Observable<ChangeRequest> {
    return this.http.post<ChangeRequest>(`${this.base}/ecn/${id}/reject`, null, {
      params: new HttpParams().set('reason', reason)
    });
  }

  getEcnImpacts(ecnId: number): Observable<EcnImpactedObject[]> {
    return this.http.get<EcnImpactedObject[]>(`${this.base}/ecn/${ecnId}/impacts`);
  }

  // ---- PPAP ----
  getProjectPpaps(projectId: number): Observable<PpapPackage[]> {
    return this.http.get<PpapPackage[]>(`${this.base}/ppap/project/${projectId}`);
  }

  createPpap(data: Partial<PpapPackage>): Observable<PpapPackage> {
    return this.http.post<PpapPackage>(`${this.base}/ppap`, data);
  }

  updatePpapStatus(ppapId: number, status: string): Observable<PpapPackage> {
    return this.http.patch<PpapPackage>(`${this.base}/ppap/${ppapId}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }

  // ---- Vendors ----
  getVendors(page = 0, size = 20): Observable<PageResponse<Vendor>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Vendor>>(`${this.base}/vendors`, { params });
  }

  getVendor(id: number): Observable<Vendor> {
    return this.http.get<Vendor>(`${this.base}/vendors/${id}`);
  }

  createVendor(data: Partial<Vendor>): Observable<Vendor> {
    return this.http.post<Vendor>(`${this.base}/vendors`, data);
  }

  updateVendorApproval(id: number, approvalStatus: string): Observable<Vendor> {
    return this.http.patch<Vendor>(`${this.base}/vendors/${id}/approval`, null, {
      params: new HttpParams().set('approvalStatus', approvalStatus)
    });
  }
}
