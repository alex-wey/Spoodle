import AppLayout from "@/components/AppLayout";

export default function PetOwnerProfileLayout({
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