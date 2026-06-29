export type Rgb = { r: number; g: number; b: number };

export type ContrastSample = {
  label: string;
  selector: string;
  fg: Rgb;
  bg: Rgb;
  ratio: number;
  fontSize: number;
  fontWeight: number;
  minRequired: number;
  pass: boolean;
};

export type AuditIssue = {
  phase: string;
  route: string;
  label: string;
  severity: "P0" | "P1" | "P2";
  detail: string;
};

export function issueFromSample(
  phase: string,
  route: string,
  sample: ContrastSample,
): AuditIssue {
  const severity: AuditIssue["severity"] =
    sample.ratio < 3 ? "P0" : sample.ratio < sample.minRequired ? "P1" : "P2";
  return {
    phase,
    route,
    label: sample.label,
    severity,
    detail: `contrast ${sample.ratio.toFixed(2)}:1 (need ≥${sample.minRequired}:1) — ${sample.selector}`,
  };
}
