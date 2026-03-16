import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Project, Part, BomTreeNode, ApqpPhase, ProjectApqpTask,
  ChangeRequest, EcnImpactedObject, PpapPackage, Vendor,
  DashboardSummary, PageResponse, Customer, Contact,
  ProgramTeamMember, ProgramMilestone, ProgramCustomerRep, ModulePermission
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

  // ---- Customers ----
  getCustomers(page = 0, size = 50): Observable<PageResponse<Customer>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<Customer>>(`${this.base}/customers`, { params });
  }

  getActiveCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.base}/customers/active`);
  }

  searchCustomers(q: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.base}/customers/search`, {
      params: new HttpParams().set('q', q)
    });
  }

  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.base}/customers/${id}`);
  }

  createCustomer(data: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(`${this.base}/customers`, data);
  }

  updateCustomer(id: number, data: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.base}/customers/${id}`, data);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/customers/${id}`);
  }

  // ---- Contacts ----
  getContacts(customerId?: number, vendorId?: number): Observable<Contact[]> {
    let params = new HttpParams();
    if (customerId) params = params.set('customerId', customerId);
    if (vendorId) params = params.set('vendorId', vendorId);
    return this.http.get<Contact[]>(`${this.base}/contacts`, { params });
  }

  createContact(data: Partial<Contact>): Observable<Contact> {
    return this.http.post<Contact>(`${this.base}/contacts`, data);
  }

  updateContact(id: number, data: Partial<Contact>): Observable<Contact> {
    return this.http.put<Contact>(`${this.base}/contacts/${id}`, data);
  }

  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/contacts/${id}`);
  }

  // ---- Program Team ----
  getProjectTeam(projectId: number): Observable<ProgramTeamMember[]> {
    return this.http.get<ProgramTeamMember[]>(`${this.base}/projects/${projectId}/team`);
  }

  addProjectTeamMember(projectId: number, userId: number, cftRole: string, isProgramManager = false): Observable<ProgramTeamMember> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('cftRole', cftRole)
      .set('isProgramManager', isProgramManager);
    return this.http.post<ProgramTeamMember>(`${this.base}/projects/${projectId}/team`, null, { params });
  }

  removeProjectTeamMember(projectId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/projects/${projectId}/team/${userId}`);
  }

  // ---- Milestones ----
  getProjectMilestones(projectId: number): Observable<ProgramMilestone[]> {
    return this.http.get<ProgramMilestone[]>(`${this.base}/projects/${projectId}/milestones`);
  }

  addProjectMilestone(projectId: number, data: Partial<ProgramMilestone>): Observable<ProgramMilestone> {
    return this.http.post<ProgramMilestone>(`${this.base}/projects/${projectId}/milestones`, data);
  }

  updateProjectMilestone(projectId: number, milestoneId: number, data: Partial<ProgramMilestone>): Observable<ProgramMilestone> {
    return this.http.put<ProgramMilestone>(`${this.base}/projects/${projectId}/milestones/${milestoneId}`, data);
  }

  deleteProjectMilestone(projectId: number, milestoneId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/projects/${projectId}/milestones/${milestoneId}`);
  }

  // ---- Customer Reps ----
  getProjectCustomerReps(projectId: number): Observable<ProgramCustomerRep[]> {
    return this.http.get<ProgramCustomerRep[]>(`${this.base}/projects/${projectId}/customer-reps`);
  }

  addProjectCustomerRep(projectId: number, contactId: number, repRole?: string, isPrimary = false): Observable<ProgramCustomerRep> {
    let params = new HttpParams().set('contactId', contactId).set('isPrimary', isPrimary);
    if (repRole) params = params.set('repRole', repRole);
    return this.http.post<ProgramCustomerRep>(`${this.base}/projects/${projectId}/customer-reps`, null, { params });
  }

  removeProjectCustomerRep(projectId: number, contactId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/projects/${projectId}/customer-reps/${contactId}`);
  }

  // ---- Module Permissions ----
  getModulePermissions(): Observable<ModulePermission[]> {
    return this.http.get<ModulePermission[]>(`${this.base}/module-permissions`);
  }

  getPermissionsByRole(roleCode: string): Observable<ModulePermission[]> {
    return this.http.get<ModulePermission[]>(`${this.base}/module-permissions/role/${roleCode}`);
  }

  updateModulePermission(id: number, data: Partial<ModulePermission>): Observable<ModulePermission> {
    return this.http.put<ModulePermission>(`${this.base}/module-permissions/${id}`, data);
  }
}
