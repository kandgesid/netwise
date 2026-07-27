export type MatchMode = 'port' | 'appid' | 'userid';
export type RuleAction = 'allow' | 'block';

export const PORT_OPTIONS = [
  { value: '443', label: '443 (typically HTTPS)' },
  { value: '80', label: '80 (typically HTTP)' },
  { value: '22', label: '22 (typically SSH)' },
];

export const APP_OPTIONS = [
  { value: 'web-browsing', label: 'web-browsing' },
  { value: 'ssh', label: 'ssh' },
  { value: 'dns', label: 'dns' },
  { value: 'tunnel', label: 'unknown-tunnel' },
  { value: 'p2p-filesharing', label: 'p2p-filesharing' },
];

export const USER_OPTIONS = [
  { value: 'finance', label: 'finance-team' },
  { value: 'engineering', label: 'engineering-team' },
  { value: 'contractor', label: 'contractor' },
  { value: 'guest', label: 'guest-wifi' },
];

export interface TrafficScenario {
  value: string; // "user:app:port"
  label: string;
}

export const TRAFFIC_SCENARIOS: TrafficScenario[] = [
  { value: 'finance:web-browsing:443', label: 'finance-team, real web browsing, port 443' },
  { value: 'guest:web-browsing:443', label: 'guest-wifi, real web browsing, port 443' },
  { value: 'contractor:tunnel:443', label: 'contractor, file-transfer tool tunneled over port 443' },
  { value: 'engineering:p2p-filesharing:443', label: 'engineering-team, p2p file-sharing disguised on port 443' },
  { value: 'engineering:ssh:22', label: 'engineering-team, SSH session, port 22' },
  { value: 'guest:ssh:22', label: 'guest-wifi, SSH session, port 22' },
];
