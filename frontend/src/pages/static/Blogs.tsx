import StaticPage from "../../components/common/StaticPage";
import * as assets from "@/assets";

const BlogsPage = () => {
  const blogs = [
    {
      title: "5 Tips for Maintaining Your Home's AC",
      image: assets.popular1,
      date: "March 15, 2026",
      category: "Maintenance",
    },
    {
      title: "How to Prepare Your Living Room for Painting",
      image: assets.popular2,
      date: "March 10, 2026",
      category: "Home Decor",
    },
    {
      title: "Benefits of Regular Professional House Cleaning",
      image: assets.popular3,
      date: "March 5, 2026",
      category: "Lifestyle",
    },
    {
      title: "Ensuring Safety: What to Check When Hiring a Plumber",
      image: assets.popular4,
      date: "March 1, 2026",
      category: "Safety",
    },
  ];

  return (
    <StaticPage
      title="Our Blog"
      subtitle="Expert insights, home maintenance tips, and life Hacks to keep your home healthy."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {blogs.map((blog, idx) => (
          <div
            key={idx}
            className="group flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-2xl md:rounded-4xl border border-neutral-100 bg-white hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all cursor-pointer"
          >
            <div className="md:w-1/2 overflow-hidden rounded-xl md:rounded-3xl aspect-4/3 md:aspect-square relative group-hover:scale-[1.02] transition-transform duration-500">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 h-8 px-4 flex items-center bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary">
                {blog.category}
              </div>
            </div>

            <div className="md:w-1/2 flex flex-col py-2">
              <span className="text-xs font-medium text-ink-muted mb-2">
                {blog.date}
              </span>
              <h4 className="text-xl md:text-2xl font-black text-ink-rich font-alexandria mb-4 leading-snug group-hover:text-primary transition-colors">
                {blog.title}
              </h4>
              <p className="text-ink-muted mb-6 flex-1 text-sm md:text-base">
                An expert guide on keeping your home environment healthy and
                efficient with minimal effort.
              </p>
              <p className="font-bold text-sm cursor-pointer tracking-widest uppercase text-primary flex items-center hover:translate-x-1 transition-transform">
                Read More →
              </p>
            </div>
          </div>
        ))}
      </div>
    </StaticPage>
  );
};

export default BlogsPage;
