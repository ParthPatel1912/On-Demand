import { useNavigate } from "react-router-dom";

import { Container } from "@/components/layout/Container";
import Logo from "../common/Logo";
import { appBadges, socialIcons } from "@/assets";
import { APP_ROUTES } from "@/routes/config";

interface FooterLink {
  label: string;
  href: string;
};

interface FooterGroup {
  title: string;
  links: FooterLink[];
};

const footerGroups: FooterGroup[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: APP_ROUTES.ABOUT_US },
      { label: "Terms & Conditions", href: APP_ROUTES.TERMS_AND_CONDITIONS },
      { label: "Privacy Policy", href: APP_ROUTES.PRIVACY_POLICY },
      { label: "Careers", href: APP_ROUTES.CAREERS },
    ],
  },
  {
    title: "For Customers",
    links: [
      { label: "Reviews", href: APP_ROUTES.REVIEWS },
      { label: "Categories", href: APP_ROUTES.CATEGORIES },
      { label: "Blogs", href: APP_ROUTES.BLOGS },
      { label: "Contact Us", href: APP_ROUTES.CONTACT },
    ],
  },
  {
    title: "For Professionals",
    links: [
      {
        label: "Become a Service Partner",
        href: APP_ROUTES.SERVICE_PARTNER_SIGNUP,
      },
    ],
  },
];

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-muted">
      <Container className="py-4 pt-10">
        <div className="grid gap-10 lg:grid-cols-[162px_1fr_120px] lg:items-start">
          <Logo />

          <div className="flex flex-col gap-10 sm:flex-row sm:flex-wrap sm:gap-16 lg:flex-nowrap lg:justify-center lg:gap-35">
            {footerGroups.map((group) => (
              <div key={group.title} className="space-y-6">
                <p className="text-sm font-semibold text-foreground">
                  {group.title}
                </p>
                <ul className="space-y-6 text-sm text-muted-foreground">
                  {group.links.map((l) => (
                    <li key={l.label}>
                      <p
                        className="cursor-pointer hover:text-foreground"
                        onClick={() => navigate(l.href)}
                      >
                        {l.label}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-6 lg:justify-self-end">
            <p className="text-sm font-semibold text-foreground">Download</p>
            <p
              className="block w-30 cursor-pointer"
              aria-label="Download our app"
              onClick={() => navigate(APP_ROUTES.HOME)}
            >
              <img src={appBadges} alt="" className="w-full" />
            </p>
          </div>
        </div>

        <div className="mt-10 h-px w-full bg-border" />

        <div className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © Copyright 2026 HomeCare
          </p>
          <div className="flex items-center sm:justify-end">
            <img src={socialIcons} alt="" className="h-11 w-auto" />
          </div>
        </div>
      </Container>
    </footer>
  );
}
