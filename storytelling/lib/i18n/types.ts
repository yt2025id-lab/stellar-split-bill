export type Locale = "en" | "id";

export interface TimelineItem {
  day: string;
  label: string;
}

export interface FeatureItem {
  name: string;
  desc: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface Dict {
  nav: { launch: string };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    titleLead: string;
    lead: string;
    leadStrong: string;
    features: string;
    ctaPrimary: string;
    ctaSecondary: string;
    cardTitle: string;
    builtOn: string;
    live: string;
    stats: StatItem[];
    ticker: string[];
    scrollCue: string;
  };
  akar: { kicker: string; title: string; body: string; statValue: string; statLabel: string; facts: string[] };
  percikan: { kicker: string; title: string; body: string; points: string[] };
  retakan: { kicker: string; title: string; body: string };
  tempaan: {
    kicker: string;
    title: string;
    body: string;
    fleeLabel: string;
    safeLabel: string;
    formula: string;
  };
  nyala: {
    kicker: string;
    title: string;
    body: string;
    streamCollateral: string;
    streamDues: string;
    streamYield: string;
  };
  sistem: {
    kicker: string;
    title: string;
    body: string;
    rules: string[];
    timeline: TimelineItem[];
  };
  galeri: {
    kicker: string;
    title: string;
    items: FeatureItem[];
  };
  bukti: {
    kicker: string;
    title: string;
    stats: StatItem[];
  };
  cta: {
    title: string;
    button: string;
    explorer: string;
    github: string;
    community: string;
  };
  landing: {
    footer: {
      tagline: string;
      blurb: string;
      productTitle: string;
      ecosystemTitle: string;
      communityTitle: string;
      deployed: string;
      event: string;
      rights: string;
      product: string[];
    };
  };
}
