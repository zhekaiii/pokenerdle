export interface NoticeTemplateProps {
  tag?: string;
  title: string;
  body?: string;
  cta?: string;
  /** Shown before the CTA text, e.g. the provider logo for a sign-in action. */
  ctaIcon?: React.ReactNode;
  onActivate?: () => void;
}
