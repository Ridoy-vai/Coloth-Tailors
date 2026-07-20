import { Truck, ShieldCheck, Heart, Sparkles } from "lucide-react";

const VALUES = [
  {
    icon: Sparkles,
    title: "Quality First",
    description: "Every piece in our catalog is checked for fabric quality, stitching, and fit before it reaches you.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "We deliver across the country in 3-5 business days, with cash-on-delivery and card payment options.",
  },
  {
    icon: ShieldCheck,
    title: "Easy Returns",
    description: "Not happy with your order? Return it within 7 days, no questions asked, as long as tags are intact.",
  },
  { 
    icon: Heart,
    title: "For the Whole Family",
    description: "From kids to adults, men to women — we curate styles for every member of your family.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            About Shopify<span className="text-blue-400">Store</span>
          </h1>
          <p className="text-slate-300 mt-4 max-w-2xl mx-auto leading-relaxed">
            We started ShopifyStore with a simple idea — make quality clothing accessible to
            everyone, for every occasion, at every stage of life.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          ShopifyStore began as a small idea: bring together well-made clothing for men, women,
          and kids in one place, without the guesswork. What started as a handful of curated
          pieces has grown into a full catalog spanning everyday essentials to statement pieces.
        </p>
        <p className="text-gray-600 leading-relaxed">
          We work directly with our sourcing partners to keep quality high and prices fair, so
          you can shop with confidence — whether you're picking out a hoodie for a rainy day or a
          dress for a special occasion.
        </p>
      </div>

      {/* Values */}
      <div className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-10 text-center">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
                >
                  <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1.5">{value.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Have questions?</h2>
        <p className="text-gray-500 mb-6">We'd love to hear from you. Reach out anytime.</p>
        <a
          href="/contact"
          className="inline-block px-7 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          Contact Us
        </a>
      </div>
    </div>
  );
}