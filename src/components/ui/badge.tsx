import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[--bg-tertiary] text-[--text-secondary] border border-[--border-primary]",
        sourced: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        sold: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        shipped: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
        gradeA: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        gradeB: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        gradeC: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
        gradeAB: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20",
        gradeBC: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        gradeABC: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20",
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
  return <Badge variant={variantMap[condition] || "default"}>{condition}</Badge>;
}

export { Badge, badgeVariants };
