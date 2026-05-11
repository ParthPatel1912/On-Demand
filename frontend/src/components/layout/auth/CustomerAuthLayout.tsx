import customerLoginBanner from "@/assets/signup-banner.png";

const CustomerAuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex w-full min-h-screen bg-white">
      {/* LEFT SIDE */}
      <article className="flex w-full lg:w-[61.5%] items-center justify-center px-6 py-8">
        <div className="w-full max-w-[360px]">{children}</div>
      </article>

      {/* RIGHT SIDE IMAGE */}
      <aside className="hidden lg:block lg:w-[38.5%] h-screen overflow-hidden">
        <img
          src={customerLoginBanner}
          alt="HomeCare login visual"
          className="h-full w-full"
        />
      </aside>
    </main>
  );
};

export default CustomerAuthLayout;