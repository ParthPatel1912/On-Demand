import StaticPage from "../../components/common/StaticPage";
import { Button } from "@/components/ui/button";

const Careers = () => {
  const currentOpenings = [
    { title: "Service Operations Manager", department: "Operations", location: "Springfield, IL" },
    { title: "Software Engineer (React/Next.js)", department: "Technology", location: "Remote" },
    { title: "Customer Support Lead", department: "Support", location: "Chicago, IL" },
    { title: "Regional Partner Success head", department: "Partnership", location: "Springfield, IL" },
  ];

  return (
    <StaticPage 
      title="Careers at HomeCare" 
      subtitle="Help us build the future of home services. Join a team of mission-driven professionals."
    >
      <div className="space-y-12">
        <section>
          <h2 className="text-heading md:text-[40px] font-black font-alexandria text-ink-rich mb-4">Grow With Us</h2>
          <p className="text-base md:text-lg">
            HomeCare is more than just an app; it's a movement to redefine how people care for their homes. We're looking for passionate individuals who are obsessed with quality and innovation to join our growing team.
          </p>
          <p>
            We offer a collaborative environment, competitive compensation, and the chance to make a real impact on people's daily lives and the livelihoods of over 500+ service partners.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold font-alexandria text-ink-rich mb-8 border-b pb-4">Current Openings</h3>
          <div className="space-y-4">
            {currentOpenings.map((job, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-2xl border border-neutral-100 bg-surface-tint hover:border-primary hover:bg-white transition-all shadow-sm hover:shadow-xl hover:shadow-primary/10"
              >
                <div>
                  <h4 className="text-xl font-bold text-ink-rich group-hover:text-primary transition-colors">{job.title}</h4>
                  <p className="text-ink-muted font-medium">{job.department} • {job.location}</p>
                </div>
                <Button variant="outline" className="mt-4 md:mt-0 rounded-full px-6 border-primary text-primary hover:bg-primary hover:text-white font-bold transition-all">
                  Apply Now
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-linear-to-br from-primary to-primary-deep p-8 md:p-14 rounded-3xl md:rounded-[40px] text-white text-center relative overflow-hidden shadow-2xl">
           <div className="absolute -top-7.5 -right-7.5 w-60 h-60 rounded-full bg-white/5 blur-3xl"></div>
           <div className="absolute -bottom-7.5 -left-7.5 w-60 h-60 rounded-full bg-black/5 blur-3xl"></div>

          <h2 className="text-3xl md:text-4xl font-black font-alexandria mb-6 relative z-10">Don’t see a role that fits?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto relative z-10">
            We are always looking for exceptional talent. Send your resume to <strong>careers@homecare.domain</strong> and tell us how you'd like to help.
          </p>
          <Button className="h-12 md:h-14 px-8 md:px-12 rounded-full bg-white text-primary hover:bg-white/90 font-black text-base md:text-lg transition-all relative z-10">
            Send General Application
          </Button>
        </section>
      </div>
    </StaticPage>
  );
};

export default Careers;
