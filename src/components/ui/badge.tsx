import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-slate-800 text-slate-300 border border-slate-700",
        sourced: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        active: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        sold: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        shipped: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
        gradeA: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        gradeB: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        gradeC: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
        gradeAB: "bg-teal-500/20 text-teal-400 border border-teal-500/30",
        gradeBC: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        gradeABC: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
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

  return (
    <Badge variant={variantMap[condition] || "default"}>
      {condition}
    </Badge>
  );
}

export { Badge, badgeVariants };
