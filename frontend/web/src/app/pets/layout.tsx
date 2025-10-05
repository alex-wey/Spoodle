import AppLayout from "@/components/AppLayout";

export default function PetProfileLayout({
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
