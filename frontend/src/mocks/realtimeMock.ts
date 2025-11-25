import { EquipmentEntity, PersonnelEntity, WorkpieceEntity } from '../types/realtime'

export const mockEquipment: EquipmentEntity[] = [
  {
    id: 'urn:ngsi-ld:Equipment:Robot-01',
    name: '焊接机器人-01',
    entityType: 'Equipment',
    status: 'Running',
    location: { type: 'Point', coordinates: [60, 110] },
    attributes: { type: 'robot', oee: 0.86, temperature: 45 },
  },
  {
    id: 'urn:ngsi-ld:Equipment:Robot-02',
    name: '焊接机器人-02',
    entityType: 'Equipment',
    status: 'Idle',
    location: { type: 'Point', coordinates: [140, 110] },
    attributes: { type: 'robot', oee: 0.8, temperature: 39 },
  },
  {
    id: 'urn:ngsi-ld:Equipment:Machining-01',
    name: '加工中心-01',
    entityType: 'Equipment',
    status: 'Running',
    location: { type: 'Point', coordinates: [520, 90] },
    attributes: { type: 'cnc', oee: 0.91, temperature: 52 },
  },
]

export const mockWorkpieces: WorkpieceEntity[] = [
  {
    id: 'urn:ngsi-ld:Workpiece:M670-SN001',
    name: '侧墙#001',
    entityType: 'Workpiece',
    status: 'InProcess',
    location: { type: 'Point', coordinates: [190, 150] },
    attributes: { progress: 0.45, queueTime: 180 },
  },
  {
    id: 'urn:ngsi-ld:Workpiece:M670-SN002',
    name: '侧墙#002',
    entityType: 'Workpiece',
    status: 'Delayed',
    location: { type: 'Point', coordinates: [280, 310] },
    attributes: { progress: 0.32, queueTime: 620 },
  },
]

export const mockPersonnel: PersonnelEntity[] = [
  {
    id: 'urn:ngsi-ld:Person:EMP-001',
    name: '张三',
    entityType: 'Person',
    status: 'Working',
    location: { type: 'Point', coordinates: [350, 120] },
    attributes: { role: '焊接工', assignedStation: 'ST-GZ-02' },
  },
  {
    id: 'urn:ngsi-ld:Person:EMP-002',
    name: '李四',
    entityType: 'Person',
    status: 'Break',
    location: { type: 'Point', coordinates: [100, 260] },
    attributes: { role: '检测员', assignedStation: 'ST-RW-01' },
  },
]

