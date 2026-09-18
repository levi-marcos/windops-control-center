export type AssetType = 'WIND_TURBINE' | 'SOLAR_ARRAY';

export type AssetStatus = 'ONLINE' | 'ATTENTION' | 'MAINTENANCE' | 'OFFLINE';

export interface Asset {
  id: string;
  name: string;
  type: AssetType | string;
  status: AssetStatus | string;
  ratedPowerMw: number;
  location: string;
  createdAt?: string;
}

export interface Telemetry {
  id?: number;
  assetId: string;
  powerMw: number;
  windSpeedMs: number | null;
  temperatureC: number;
  timestamp: string;
  createdAt?: string;
}

export interface AssetSummary {
  assetId: string;
  samples: number;
  averagePowerMw: number;
  maxTemperatureC: number | null;
  warningAlerts: number;
  criticalAlerts: number;
}

export interface CreateTelemetryDto {
  powerMw: number;
  windSpeedMs?: number | null;
  temperatureC: number;
  timestamp: string;
}

export interface TelemetryResult {
  id?: number;
  assetId: string;
  powerMw: number;
  windSpeedMs: number | null;
  temperatureC: number;
  timestamp: string;
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  alert: {
    id: string;
    assetId: string;
    severity: string;
    type: string;
    message: string;
    timestamp: string;
  } | null;
}

export interface HealthResponse {
  status: string;
}

export interface DashboardOverview {
  totalAssets: number;
  onlineAssets: number;
  attentionAssets: number;
  maintenanceAssets: number;
  criticalAlerts: number;
  totalAlerts: number;
}

export interface Alert {
  id: string;
  assetId: string;
  severity: 'WARNING' | 'CRITICAL' | string;
  type: string;
  message: string;
  timestamp: string;
  createdAt?: string;
}


