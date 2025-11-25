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
}

export type ChecklistState = Record<string, ChecklistItemState>;

export interface House {
    id: string;
    name: string;
}

export type UserRole = 'dev' | 'manager' | 'supervisor' | 'technician';

export interface User {
    email: string;
    name: string;
    role: UserRole;
}
