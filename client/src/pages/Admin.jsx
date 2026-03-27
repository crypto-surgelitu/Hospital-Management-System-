import Card from '../components/ui/Card';

export default function Admin() {
  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-[2rem] font-bold text-[var(--color-ink-900)] leading-tight tracking-tight">Admin</h1>
        <p className="text-[var(--color-text-muted)] text-[15px] mt-1 font-medium">System Administration Settings</p>
      </div>
      <Card>
        <p className="text-[var(--color-text-muted)]">Admin module settings coming soon.</p>
      </Card>
    </div>
  );
}