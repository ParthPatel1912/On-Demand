import StaticPage from "../../components/common/StaticPage";
import { Star } from "lucide-react";

const Reviews = () => {
  const reviews = [
    { 
      name: "Sarah Johnson", 
      rating: 5, 
      text: "Absolutely the best home service platform I've used. The cleaning professional was incredibly detailed and professional. My home has never looked better!", 
      service: "House Cleaning" 
    },
    { 
      name: "Michael Chen", 
      rating: 5, 
      text: "Fast, reliable, and reasonably priced. I had an electrical issue solved within hours of booking. Highly recommended for any household maintenance.", 
      service: "Electrical Repair" 
    },
    { 
      name: "Aisha Patel", 
      rating: 4.8, 
      text: "Truly impressive service. The garden maintenance team did a fantastic job, and the booking process was seamless. I'll definitely be using HomeCare again.", 
      service: "Gardening" 
    },
    { 
      name: "David Smith", 
      rating: 5, 
      text: "Professional, punctual, and very respectful. It's rare to find such high-quality service providers in one place. HomeCare has simplified my life.", 
      service: "Plumbing Service" 
    },
  ];

  return (
    <StaticPage 
      title="Customer Reviews" 
      subtitle="Hear what our community has to say about their HomeCare experience."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.map((rev, idx) => (
          <div 
            key={idx} 
            className="p-6 md:p-8 rounded-2xl md:rounded-4xl border border-neutral-100 bg-white shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all group"
          >
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`size-5 ${i < Math.floor(rev.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`} 
                />
              ))}
              <span className="ml-2 font-bold text-ink-rich">{rev.rating}</span>
            </div>
            
            <p className="text-base md:text-lg text-ink mb-6 leading-relaxed italic">
              "{rev.text}"
            </p>
            
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                {rev.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-ink-rich">{rev.name}</h4>
                <p className="text-ink-muted text-sm font-medium">{rev.service} • Verified Customer</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </StaticPage>
  );
};

export default Reviews;
