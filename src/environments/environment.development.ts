import { EnvironmentAttestation } from './EnvironmentAttestation';

export const environment = {
  apiUrl: 'https://verifier-backend.arte.projj.eu',
  appName: 'Verifier',
  openid4vpDraft: '1.0',

  jar_mode: 'by_reference',

  attestation: [
    {
      key: 'AV',
      value: 'av',
      scheme: 'av://',
      name: 'Age Verification (AV)',
      format: [
        {
          type: 'mso_mdoc',
          doctype: 'eu.europa.ec.av.1',
          namespace: 'eu.europa.ec.av.1',
        },
      ],
      dataSet: [
        { identifier: 'age_over_13', attribute: 'Age Over 13' },
        { identifier: 'age_over_15', attribute: 'Age Over 15' },
        { identifier: 'age_over_16', attribute: 'Age Over 16' },
        { identifier: 'age_over_18', attribute: 'Age Over 18' },
        { identifier: 'age_over_21', attribute: 'Age Over 21' },
        { identifier: 'age_over_23', attribute: 'Age Over 23' },
        { identifier: 'age_over_25', attribute: 'Age Over 25' },
        { identifier: 'age_over_27', attribute: 'Age Over 27' },
        { identifier: 'age_over_28', attribute: 'Age Over 28' },
        { identifier: 'age_over_40', attribute: 'Age Over 40' },
        { identifier: 'age_over_60', attribute: 'Age Over 60' },
        { identifier: 'age_over_65', attribute: 'Age Over 65' },
        { identifier: 'age_over_67', attribute: 'Age Over 67' },
      ],
    },
  ] as EnvironmentAttestation[],
};
