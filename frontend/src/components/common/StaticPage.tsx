import React from "react";
import { Container } from "@/components/layout/Container";

interface IProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const StaticPage = ({ title, subtitle, children }: IProps) => {
  return (
    <>
      {/* Header Section */}
      <section className="bg-linear-to-b from-surface-tint to-white py-12 md:py-24 border-b">
        <Container className="text-center">
          <h1 className="text-[32px] md:text-[48px] lg:text-[56px] font-black font-alexandria text-ink-rich leading-tight mb-4 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base md:text-xl text-ink-muted max-w-2xl mx-auto font-medium">
              {subtitle}
            </p>
          )}
        </Container>
      </section>

      {/* Content Section */}
      <Container className="py-12 md:py-24 px-4 md:px-0">
        <div className="prose prose-lg max-w-4xl mx-auto font-alexandria text-ink leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700">
          {children}
        </div>
      </Container>
    </>
  );
};

export default StaticPage;
