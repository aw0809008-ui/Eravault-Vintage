import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-stone-100 text-stone-800",
        sourced: "bg-blue-100 text-blue-800",
        active: "bg-green-100 text-green-800",
        sold: "bg-amber-100 text-amber-800",
        shipped: "bg-purple-100 text-purple-800",
        gradeA: "bg-emerald-100 text-emerald-800",
        gradeB: "bg-blue-100 text-blue-800",
        gradeC: "bg-orange-100 text-orange-800",
        gradeAB: "bg-teal-100 text-teal-800",
        gradeBC: "bg-yellow-100 text-yellow-800",
        gradeABC: "bg-pink-100 text-pink-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "sourced" | "active" | "sold" | "shipped"> = {
    Sourced: "sourced",
    "Active on Fleek": "active",
    Sold: "sold",
    Shipped: "shipped",
  };

  return <Badge variant={variantMap[status] || "default"}>{status}</Badge>;
}

export function ConditionBadge({ condition }: { condition: string }) {
  const variantMap: Record<string, "gradeA" | "gradeB" | "gradeC" | "gradeAB" | "gradeBC" | "gradeABC"> = {
    A: "gradeA",
    B: "gradeB",
    C: "gradeC",
    AB: "gradeAB",
    BC: "gradeBC",
    ABC: "gradeABC",
  };

  const labels: Record<string, string> = {
    A: "A",
    B: "B",
    C: "C",
    AB: "AB",
    BC: "BC",
    ABC: "ABC",
  };

  return (
    <Badge variant={variantMap[condition] || "default"}>
      {labels[condition] || condition}
    </Badge>
  );
}

export { Badge, badgeVariants };
