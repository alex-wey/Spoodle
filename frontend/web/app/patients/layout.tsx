import AppLayout from "../../components/AppLayout";

export default function PatientProfileLayout({
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
