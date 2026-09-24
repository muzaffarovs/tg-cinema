/** Re-mounts per navigation so every page gets a soft enter transition. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
