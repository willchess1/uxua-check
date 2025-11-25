export type Status = 0 | 1 | 2 | 3;

export interface StatusInfo {
  label: string;
  color: string;
  ring: string;
  icon: string;
  button: string;
}

export interface ChecklistItem {
  id: string;
  category: string;
  description: string;
}

export interface ChecklistItemState {
  status: Status;
  note: string;
  photos: string[];
}

export type ChecklistState = Record<string, ChecklistItemState>;

export interface House {
    id: string;
    name: string;
}

export type UserRole = 'dev' | 'manager' | 'supervisor' | 'technician';

export interface User {
    name: string;
    role: UserRole;
}

export type InspectionType = 'Preventiva' | 'Corretiva' | 'Pós Check-out' | 'Pré Check-in';

export interface ScheduledInspection {
    id: string;
    houseId: string;
    houseName: string;
    technicianName: string;
    scheduledDate: Date;
    type: InspectionType;
    status: 'Agendada' | 'Concluída' | 'Cancelada';
}
