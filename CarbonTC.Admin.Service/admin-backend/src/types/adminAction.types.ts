import { AdminActionType } from "./enum";

export interface IAdminAction {
  actionId: string;
  adminId: string;
  actionType: AdminActionType;
  targetId: string;
  description: string;
  createdAt: Date;
  actionDetails?: Record<string, any>;
}

export interface CreateAdminActionDTO {
  actionType: AdminActionType;
  targetId: string;
  description: string;
  actionDetails?: Record<string, any>;
}