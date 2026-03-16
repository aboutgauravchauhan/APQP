// =============================================================
// Core Domain Models
// =============================================================

export interface Project {
  id: number;
  munNo: string;
  projectCode: string;
  projectName: string;
  customerId: number;
  customerName?: string;
  plantId: number;
  plantName?: string;
  vehicleName?: string;
  vehiclePlatform?: string;
  modelName?: string;
  customerPartNo?: string;
  internalPartNo?: string;
  sopDate?: string;
  sampleDate?: string;
  annualVolume?: number;
  dailyVolume?: number;
  projectType: ProjectType;
  status: ProjectStatus;
  riskLevel: RiskLevel;
  riskRemarks?: string;
  projectManagerId?: number;
  projectManagerName?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectType = 'NEW_DEVELOPMENT' | 'RESOURCING' | 'ENGINEERING_CHANGE' | 'CAPACITY_EXPANSION';
export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type RiskLevel = 'GREEN' | 'AMBER' | 'RED';

export interface Part {
  id: number;
  projectId: number;
  partNo: string;
  partName: string;
  partType: PartType;
  customerDrawingNo?: string;
  internalDrawingNo?: string;
  drawingRevision: string;
  materialSpec?: string;
  materialGrade?: string;
  weightKg?: number;
  uom: string;
  criticality?: string;
  sourcingType: SourcingType;
  isActive: boolean;
}

export type PartType = 'ASSEMBLY' | 'SUB_ASSEMBLY' | 'COMPONENT' | 'RAW_MATERIAL' | 'BOUGHT_OUT' | 'SERVICE';
export type SourcingType = 'INHOUSE' | 'BOUGHT_OUT' | 'SUBCONTRACT' | 'CONSIGNMENT';

export interface BomTreeNode {
  bomLineId?: number;
  partId: number;
  partNo: string;
  partName: string;
  partType: PartType;
  sourcingType: SourcingType;
  drawingRevision: string;
  materialSpec?: string;
  weightKg?: number;
  quantity: number;
  uom: string;
  scrapPercent?: number;
  findNo?: string;
  preferredVendorId?: number;
  vendorName?: string;
  levelNo: number;
  sequenceNo: number;
  children: BomTreeNode[];
}

export interface ApqpPhase {
  id: number;
  phaseCode: string;
  phaseName: string;
  sequenceNo: number;
  description?: string;
}

export interface ProjectApqpTask {
  id: number;
  projectId: number;
  partId?: number;
  phaseId: number;
  taskCode: string;
  taskName: string;
  ownerUserId?: number;
  departmentId?: number;
  plannedStart?: string;
  plannedEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  status: TaskStatus;
  priority: PriorityLevel;
  percentComplete: number;
  dependencyTaskId?: number;
  isBlocking: boolean;
  riskLevel: RiskLevel;
  escalationLevel: number;
  remarks?: string;
}

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED' | 'OVERDUE';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ChangeRequest {
  id: number;
  projectId: number;
  partId?: number;
  ecnNo: string;
  ecnType: EcnType;
  severity: EcnSeverity;
  title: string;
  description: string;
  reason: string;
  impactCost?: number;
  impactTimelineDays?: number;
  impactQuality?: string;
  status: EcnStatus;
  effectiveDate?: string;
  oldRevision?: string;
  newRevision?: string;
  requestedBy: number;
  requestedAt: string;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
}

export type EcnType = 'DESIGN_CHANGE' | 'PROCESS_CHANGE' | 'MATERIAL_CHANGE' | 'VENDOR_CHANGE' | 'TOOLING_CHANGE' | 'COST_REDUCTION' | 'QUALITY_IMPROVEMENT';
export type EcnSeverity = 'MINOR' | 'MODERATE' | 'MAJOR';
export type EcnStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED' | 'CLOSED';

export interface EcnImpactedObject {
  id: number;
  ecnId: number;
  objectType: string;
  objectId: number;
  objectRef?: string;
  oldValue?: string;
  newValue?: string;
  actionRequired?: string;
  isResolved: boolean;
}

export interface PpapPackage {
  id: number;
  projectId: number;
  partId: number;
  vendorId?: number;
  ppapLevel: string;
  submissionDate?: string;
  overallStatus: PpapStatus;
  pswStatus: PpapStatus;
  resubmissionRequired: boolean;
  resubmissionReason?: string;
}

export type PpapStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'RESUBMIT_REQUIRED';

export interface Vendor {
  id: number;
  vendorCode: string;
  vendorName: string;
  vendorType: string;
  location?: string;
  contactPerson?: string;
  contactEmail?: string;
  status: VendorStatus;
  approvalStatus: VendorApprovalStatus;
}

export type VendorStatus = 'ACTIVE' | 'INACTIVE' | 'BLACKLISTED' | 'UNDER_DEVELOPMENT';
export type VendorApprovalStatus = 'NOT_EVALUATED' | 'APPROVED' | 'CONDITIONAL' | 'REJECTED';

export interface DashboardSummary {
  totalActiveProjects: number;
  projectsOnSchedule: number;
  projectsDelayed: number;
  projectsAtRisk: number;
  projectsCompleted: number;
  overdueTasks: number;
  tasksInProgress: number;
  tasksDueThisWeek: number;
  ppapPending: number;
  ppapApproved: number;
  ppapResubmissionRequired: number;
  openEcns: number;
  ecnsPendingApproval: number;
  vendorsNotEvaluated: number;
  vendorsBlacklisted: number;
  phaseKpis: PhaseKpi[];
  alerts: Alert[];
}

export interface PhaseKpi {
  phaseCode: string;
  phaseName: string;
  totalTasks: number;
  completed: number;
  overdue: number;
}

export interface Alert {
  type: string;
  message: string;
  severity: 'GREEN' | 'AMBER' | 'RED';
  entityId?: number;
  entityType?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface User {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string;
  designation?: string;
  roleId: number;
  plantId: number;
  departmentId: number;
}

export interface Customer {
  id: number;
  customerCode: string;
  customerName: string;
  oemType?: string;
  location?: string;
  country?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contact {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  customerId?: number;
  vendorId?: number;
  primary: boolean;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramTeamMember {
  id: number;
  projectId: number;
  userId: number;
  cftRole: string;
  programManager: boolean;
  createdAt?: string;
  // enriched
  userName?: string;
  userEmail?: string;
}

export interface ProgramMilestone {
  id?: number;
  projectId?: number;
  milestoneName: string;
  milestoneType: string;
  plannedDate?: string;
  actualDate?: string;
  status: string;
  ownerUserId?: number;
  notes?: string;
  sequenceNo: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProgramCustomerRep {
  id: number;
  projectId: number;
  contactId: number;
  repRole?: string;
  primary: boolean;
  createdAt?: string;
  // enriched
  contactName?: string;
  contactEmail?: string;
}

export interface ModulePermission {
  id: number;
  roleCode: string;
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}
