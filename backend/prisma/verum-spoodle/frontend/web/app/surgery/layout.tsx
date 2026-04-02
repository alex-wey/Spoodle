import AppLayout from "../../components/AppLayout";

export default function SurgeryLayout({
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



