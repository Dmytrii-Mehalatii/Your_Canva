export default function Divider({ className = "" }: { className?: string }) {
  return <div className={`w-0.5 shrink-0 self-stretch bg-blush ${className}`} />;
}
