import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/routes/config";
import { Container } from "../layout/Container";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-surface-tint font-alexandria">
      {/* Header */}
      <header className="border-b border-0 border-foreground/10 bg-background">
        <Container className="flex h-19.75 items-center justify-between">
          <Logo />
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
          <h1 className="text-[120px] font-black text-primary leading-none mb-4 opacity-10 select-none">
            404
          </h1>

          <div className="relative">
            <h2 className="text-heading md:text-[32px] font-bold text-ink-rich mb-3">
              Lost in Space?
            </h2>
            <p className="text-base text-ink-muted mb-10 font-medium">
              The page you're looking for has moved or doesn't exist. Let's get
              you back on track!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                className="rounded-full font-bold text-primary border-2"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Button
                className="rounded-full"
                onClick={() => navigate(APP_ROUTES.HOME)}
              >
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-10 text-center">
        <p className="text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} HomeCare. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default NotFoundPage;
