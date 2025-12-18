export type EnvironmentAttestation = {
  key: string;
  value: string;
  name: string;
  format?: AttestationFormatDef[];
  dataSet: DataElement[];
  scheme?: string;
};

type DataElement = {
  identifier: string;
  attribute: string;
};

type MsoMdocFormat = {
  type: 'mso_mdoc';
  doctype: string;
  namespace: string;
};

type SdJwtVcFormat = {
  type: 'sd_jwt_vc';
  vct: string;
};

type AttestationFormatDef = MsoMdocFormat | SdJwtVcFormat;
