import StaticPage from "../../components/common/StaticPage";
import * as assets from "@/assets";

const CategoriesPage = () => {
  const categories = [
    {
      title: "Women's Salon",
      icon: assets.categoryWomensSalon,
      desc: "Professional hair and skin care at your doorstep.",
    },
    {
      title: "Men's Salon",
      icon: assets.categoryMensSalon,
      desc: "Grooming services conveniently delivered to your home.",
    },
    {
      title: "AC & Appliance Repair",
      icon: assets.categoryAcAppliance,
      desc: "Reliable maintenance for your crucial home electronics.",
    },
    {
      title: "House Cleaning",
      icon: assets.categoryCleaning,
      desc: "Complete home cleaning with professional-grade tools.",
    },
    {
      title: "Electrical & Plumbing",
      icon: assets.categoryElectricianPlumberCarpenter,
      desc: "Expert technicians for all your infrastructure repairs.",
    },
    {
      title: "Painting & Waterproofing",
      icon: assets.categoryPaintingWaterproofing,
      desc: "Quality finishes to protect and beautify your walls.",
    },
  ];

  return (
    <StaticPage
      title="Our Service Categories"
      subtitle="Explore our comprehensive range of professional home services."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="group p-6 md:p-8 rounded-2xl md:rounded-4xl border border-neutral-100 bg-surface-tint hover:bg-white hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all text-center flex flex-col items-center"
          >
            <div className="size-20 bg-white rounded-3xl border border-neutral-100 flex items-center justify-center p-4 mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-primary/20 transition-all duration-300">
              <img
                src={cat.icon}
                alt={cat.title}
                className="size-12 object-contain group-hover:contrast-125"
              />
            </div>
            <h4 className="text-xl font-bold text-ink-rich mb-3 font-alexandria tracking-tight">
              {cat.title}
            </h4>
            <p className="text-ink-muted leading-relaxed mb-6 flex-1">
              {cat.desc}
            </p>
            <p className="text-primary font-bold text-sm cursor-pointer tracking-widest uppercase flex items-center hover:translate-x-1 transition-transform">
              Learn More →
            </p>
          </div>
        ))}
      </div>
    </StaticPage>
  );
};

export default CategoriesPage;
