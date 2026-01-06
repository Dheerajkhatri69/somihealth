import DashboardClientLayout from './DashboardClientLayout';

export const metadata = {
  title: "Async",
  description: "Main Dashboard of Somi Health",
};

export default function DashboardLayout({ children }) {
  return (
    <DashboardClientLayout>
      {children}
    </DashboardClientLayout>
  );
}
