
export interface ISystemConfig {
  configId: string;
  configKey: string;
  configValue: string;
  description?: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface UpdateSystemConfigDTO {
  configValue: string;
  description?: string;
}