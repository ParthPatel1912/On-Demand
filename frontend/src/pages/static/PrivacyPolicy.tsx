import StaticPage from "../../components/common/StaticPage";
import { PRIVACY_POLICY_TEXT } from "@/constants/static.text";

const PrivacyPolicy = () => {
  return (
    <StaticPage 
      title={PRIVACY_POLICY_TEXT.title} 
      subtitle={PRIVACY_POLICY_TEXT.subtitle}
    >
      <div className="space-y-10">
        {PRIVACY_POLICY_TEXT.sections.map((section, idx) => (
          <section key={idx}>
            <h2 className="text-2xl font-bold font-alexandria text-ink-rich mb-4">
              {section.title}
            </h2>
            {section.content?.map((p, pIdx) => (
              <p key={pIdx} className={pIdx > 0 ? "mt-4" : ""}>
                {p}
              </p>
            ))}
            {section.points && (
              <ul className="list-disc pl-5 space-y-2 mt-4">
                {section.points.map((point, pIdx) => (
                  <li key={pIdx}>
                    <strong>{point.label}:</strong> {point.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <p className="text-sm text-neutral-400 mt-12 pb-10">
          {PRIVACY_POLICY_TEXT.lastUpdated}
        </p>
      </div>
    </StaticPage>
  );
};

export default PrivacyPolicy;
