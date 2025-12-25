export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Observation {
  id: string;
  starId: string;
  starName: string;
  timestamp: string; // ISO string
  notes: string;
  seeing: number; // 1-5
  location: {
    lat: number;
    lng: number;
  };
  syncStatus: 'local' | 'synced';
}