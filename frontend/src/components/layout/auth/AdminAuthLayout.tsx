import adminLoginLeftImage from "@/assets/AdminLoginLeft.png";

const AdminAuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-white">
      <article className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-10">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-[400px] lg:max-w-[350px]">
          {children}
        </div>
      </article>

      <aside className="hidden overflow-hidden bg-indigo-900 lg:block lg:w-[45%] lg:min-h-screen lg:relative">
        <img
          src={adminLoginLeftImage}
          alt="HomeCare login visual"
          className="h-full w-full object-cover lg:absolute lg:inset-0 lg:max-w-none lg:object-left"
        />
      </aside>
    </main>
  );
};

export default AdminAuthLayout;
