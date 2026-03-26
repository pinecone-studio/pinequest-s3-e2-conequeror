import Header from "../_component/Header";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F8FC]">
      <Header />
      <main className="mx-auto max-w-[1245px] px-8 py-10">{children}</main>
    </div>
  );
}
