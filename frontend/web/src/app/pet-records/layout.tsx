import AppLayout from "@/components/AppLayout";

export default function PetRecordsLayout({
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
