// The site's signature element: a thin gradient line running harbour teal →
// spinifex gold → poinciana red, standing in for a Top End dry-season
// sunset. It recurs as a divider between every major section so the brand
// has one motif a visitor will actually remember, instead of a generic
// rule or drop-shadow.
export default function HorizonDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`h-[3px] w-full bg-horizon-gradient ${className}`} aria-hidden="true" />
  );
}
