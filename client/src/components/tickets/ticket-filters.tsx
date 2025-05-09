import { Button } from "@/components/ui/button";

interface TicketFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function TicketFilters({ activeFilter, onFilterChange }: TicketFiltersProps) {
  const filters = [
    { id: "all", label: "All Trains" },
    { id: "morning", label: "Morning" },
    { id: "afternoon", label: "Afternoon" },
    { id: "evening", label: "Evening" },
    { id: "night", label: "Night" }
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filters.map(filter => (
        <Button
          key={filter.id}
          variant={activeFilter === filter.id ? "default" : "outline"}
          className={activeFilter === filter.id 
            ? "bg-primary text-white" 
            : "bg-white text-neutral hover:bg-neutral-lightest"
          }
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
