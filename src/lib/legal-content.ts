export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalDocument = {
  title: string;
  intro: string[];
  sections: LegalSection[];
  updated: string;
  languageNote?: string;
};
