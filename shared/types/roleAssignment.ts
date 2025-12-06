import type { NGSIContext, NGSIProperty, NGSIRelationship } from './ngsi'

export type AssignmentStatus = 'Active' | 'Suspended' | 'Revoked' | 'Expired'

export interface RoleEntity {
  id: string
  type: 'Role'
  '@context': NGSIContext
  name: NGSIProperty<string>
  responsibilities: NGSIProperty<string[]>
  description?: NGSIProperty<string>
  permissionSet?: NGSIProperty<string[]>
  qualificationReq?: NGSIRelationship[]
  kpiOwnership?: NGSIProperty<string[]>
  effectiveFrom?: NGSIProperty<string>
  effectiveTo?: NGSIProperty<string>
  orgScope?: NGSIRelationship
  relatedFunctions?: NGSIRelationship[]
  ownerOrg?: NGSIRelationship
  policyRef?: NGSIRelationship
}

export interface AssignmentEntity {
  id: string
  type: 'Assignment'
  '@context': NGSIContext
  assigneeId: NGSIRelationship
  roleId: NGSIRelationship
  orgId: NGSIRelationship
  validFrom: NGSIProperty<string>
  validTo: NGSIProperty<string>
  assignmentStatus: NGSIProperty<AssignmentStatus>
  shiftId?: NGSIProperty<string>
  qualificationRef?: NGSIRelationship[]
  approvalRef?: NGSIRelationship
  createdBy?: NGSIRelationship
  notes?: NGSIProperty<string>
  sceneId?: NGSIRelationship
}







