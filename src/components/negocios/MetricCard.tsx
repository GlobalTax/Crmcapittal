/**
 * MetricCard Component
 * 
 * Displays a single metric card with label and value.
 * Used in the metrics dashboard section.
 * 
 * @param label - The metric label to display
 * @param value - The metric value to display
 * @param color - Optional color class for the value text
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  color?: string;
}

export const MetricCard = ({ label, value, color = "" }: MetricCardProps) => {
  return (
    <div className="bg-background rounded-lg p-6 border border-border">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={`text-sm font-bold mt-2 block ${color}`}>
        {value}
      </span>
    </div>
  );};
