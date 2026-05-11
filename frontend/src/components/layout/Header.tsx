import { useState, useCallback, useMemo, memo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MenuIcon, XIcon } from "lucide-react";
import toast from "react-hot-toast";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "../common/Logo";
import { APP_ROUTES, IMPLEMENTED_ROUTES } from "@/routes/config";
import HeaderUserMenu from "./admin/headerUserMenu";

// --- Types ---

interface NavItem {
  label: string;
  href: string;
}

// --- Sub-components (Memoized) ---

const NavLinkItem = memo(
  ({
    item,
    isActive,
    onClick,
    className = "",
  }: {
    item: NavItem;
    isActive: boolean;
    onClick: (href: string) => void;
    className?: string;
  }) => (
    <p
      className={cn(
        "font-medium text-base cursor-pointer hover:text-primary/70",
        isActive ? "text-primary" : "text-ink-muted",
        className,
      )}
      onClick={() => onClick(item.href)}
    >
      {item.label}
    </p>
  ),
);

NavLinkItem.displayName = "NavLinkItem";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Memoized Navigation Items ---
  const navItems = useMemo<NavItem[]>(
    () => [
      { label: "Home", href: APP_ROUTES.HOME },
      { label: "Services", href: APP_ROUTES.SERVICES },
      { label: "Contact Us", href: APP_ROUTES.CONTACT },
    ],
    [],
  );

  // --- Handlers (Memoized) ---
  const handleNavClick = useCallback(
    (href: string) => {
      if (IMPLEMENTED_ROUTES.includes(href)) {
        navigate(href);
      } else {
        toast("Yet to be implemented");
      }
      setIsMobileMenuOpen(false);
    },
    [navigate],
  );

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <header className="border-b border-0 border-foreground/10 bg-background">
      <Container className="flex h-19.75 items-center justify-between">
        <Logo />

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <nav
              className="ml-6 hidden items-center gap-8 md:flex"
              aria-label="Primary"
            >
              {navItems.map((item) => (
                <NavLinkItem
                  key={item.label}
                  item={item}
                  isActive={location.pathname === item.href}
                  onClick={handleNavClick}
                />
              ))}
              <HeaderUserMenu />
            </nav>
          </div>

          <Button
            variant="outline"
            className="size-9 rounded-full p-2.5 md:hidden hover:bg-inherit"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>
      </Container>

      {isMobileMenuOpen && (
        <div className="border-t border-foreground/10 bg-background md:hidden">
          <Container className="flex flex-col gap-1 py-3">
            {navItems.map((item) => (
              <NavLinkItem
                key={item.label}
                item={item}
                isActive={location.pathname === item.href}
                onClick={handleNavClick}
                className="rounded-full px-4 py-2 text-sm"
              />
            ))}

            <div className="mt-2 border-t border-foreground/5 pt-3">
              <HeaderUserMenu isMobile onClose={closeMobileMenu} />
            </div>
          </Container>
        </div>
      )}
    </header>
  );
};

export default memo(Header);
