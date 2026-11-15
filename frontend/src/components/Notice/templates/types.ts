export interface NoticeTemplateProps {
  tag?: string;
  title: string;
  body?: string;
  cta?: string;
  onActivate?: () => void;
}
