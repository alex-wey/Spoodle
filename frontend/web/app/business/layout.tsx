import AppLayout from "../../components/AppLayout";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
