import type { AppConfig, TrainingPayload, ExportOptions } from '../types';

const KEYS = {
  config: 'opx_config',
  payload: 'opx_payload',
  step: 'opx_step',
  exportOptions: 'opx_export_options',
} as const;

export const storage = {
  saveConfig(config: AppConfig) {
    try { localStorage.setItem(KEYS.config, JSON.stringify(config)); } catch {}
  },
  loadConfig(): AppConfig | null {
    try {
      const raw = localStorage.getItem(KEYS.config);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  savePayload(payload: TrainingPayload) {
    try { localStorage.setItem(KEYS.payload, JSON.stringify(payload)); } catch {}
  },
  loadPayload(): TrainingPayload | null {
    try {
      const raw = localStorage.getItem(KEYS.payload);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  saveStep(step: number) {
    try { localStorage.setItem(KEYS.step, String(step)); } catch {}
  },
  loadStep(): number {
    try {
      const raw = localStorage.getItem(KEYS.step);
      return raw ? parseInt(raw, 10) : 1;
    } catch { return 1; }
  },
  saveExportOptions(opts: ExportOptions) {
    try { localStorage.setItem(KEYS.exportOptions, JSON.stringify(opts)); } catch {}
  },
  loadExportOptions(): ExportOptions | null {
    try {
      const raw = localStorage.getItem(KEYS.exportOptions);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  clearAll() {
    try {
      Object.values(KEYS).forEach(k => localStorage.removeItem(k));
    } catch {}
  },
};
