import { contactUsImage } from "@/assets";
import StaticPage from "../../components/common/StaticPage";
import { ABOUT_US_TEXT } from "@/constants/static.text";

const AboutUs = () => {
  return (
    <StaticPage
      title={ABOUT_US_TEXT.title}
      subtitle={ABOUT_US_TEXT.subtitle}
    >
      <div className="space-y-12">
        <section>
          <img
            src={contactUsImage}
            alt="Our Mission"
            className="w-full h-60 md:h-100 object-cover rounded-2xl md:rounded-4xl mb-8 shadow-xl"
          />
          <h2 className="text-3xl font-bold font-alexandria text-ink-rich mb-4">
            {ABOUT_US_TEXT.missionTitle}
          </h2>
          <p>
            {ABOUT_US_TEXT.missionP1}
          </p>
          <p>
            {ABOUT_US_TEXT.missionP2}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <section>
            <h2 className="text-2xl font-bold font-alexandria text-ink-rich mb-4">
              {ABOUT_US_TEXT.storyTitle}
            </h2>
            <p>
              {ABOUT_US_TEXT.storyP1}
            </p>
            <p>
              {ABOUT_US_TEXT.storyP2}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold font-alexandria text-ink-rich mb-4">
              {ABOUT_US_TEXT.whyChooseTitle}
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              {ABOUT_US_TEXT.whyChoosePoints.map((point, index) => (
                <li key={index}>
                  <strong>{point.title}:</strong> {point.desc}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="bg-primary/5 p-6 md:p-12 rounded-2xl md:rounded-4xl border border-primary/10">
          <h2 className="text-2xl font-bold font-alexandria text-primary mb-4 text-center">
            {ABOUT_US_TEXT.commitmentTitle}
          </h2>
          <p className="text-center max-w-2xl mx-auto italic">
            "{ABOUT_US_TEXT.commitmentMsg}"
          </p>
        </section>
      </div>
    </StaticPage>
  );
};

export default AboutUs;
