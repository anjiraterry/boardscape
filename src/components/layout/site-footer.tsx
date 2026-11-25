import { WordmarkFooter, type FooterColumn } from "@/components/layout/wordmark-footer";

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Outdoor", href: "/outdoor-advertising" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "boardscape Atlas", href: "/atlas" },
      { label: "Shortlist", href: "/shortlist" },
      { label: "Submit Brief", href: "/brief" },
      { label: "Client Portal", href: "/client" },
    ],
  },
  {
    title: "Operations",
    links: [
      { label: "Studio", href: "/studio" },
      { label: "Field Survey", href: "/field/surveys" },
      { label: "Operator Workspace", href: "/operator/inventory" },
      { label: "Privacy & Terms", href: "/privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <WordmarkFooter
      name="boardscape"
      legalName="boardscape"
      year={new Date().getFullYear()}
      description="Ideas. Media. Intelligence. An independent advertising and marketing company combining creative strategy, media buying, and outdoor execution."
      columns={FOOTER_COLUMNS}
      credit={{ label: "Terms", href: "/terms" }}
    />
  );
}
