import { environment } from '@environments/environment';

export const AttestationType = {
  PID: 'pid',
  MDL: 'mdl',
  PHOTO_ID: 'photo_id',
  EHIC: 'ehic',
  EHIC_DC4EU: 'ehic-dc4eu',
  PDA1: 'pda1',
  LEARNING_CREDENTIAL: 'learning_credential',
  ...registerDynamicAttestationType(),
} as const;

export type AttestationType =
  | (typeof AttestationType)[keyof typeof AttestationType]
  | string;

export function registerDynamicAttestationType() {
  const map: Record<string, string> = {};

  const attestationTypesFromEnv = environment.attestation ?? [];

  for (const attestation of attestationTypesFromEnv) {
    const key = attestation.key.toUpperCase();
    map[key] = attestation.value;
  }
  return map;
}

registerDynamicAttestationType();
