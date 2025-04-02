export type Bond = {
  __typename?: string;
  year: number;
  maturityDate: number;
  description: string;
  comments: string;
  code: string;
  value: number;
  period: string;
  amountIssued: number;
  duration: string;
  maturityType: string;
  issuedCurrency: string;
};

export type BondData = {
  updated: string;
  bonds_current: Bond[];
  bonds_3m?: Bond[];
  bonds_1y?: Bond[];
  bonds_3y?: Bond[];
  [key: string]: Bond[] | string | undefined;
};
