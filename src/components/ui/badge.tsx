import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border", {
  variants: { variant: {
    default: "bg-[--bg-hover] text-[--text-sub] border-[--border]",
    sourced: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    sold: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    shipped: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    gradeA: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    gradeB: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    gradeC: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    gradeAB: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    gradeBC: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    gradeABC: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
  }}, defaultVariants: { variant: "default" }
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}
function Badge({ className, variant, ...props }: BadgeProps) { return <div className={cn(badgeVariants({ variant }), className)} {...props} />; }

export function StatusBadge({ status }: { status: string }) {
  const m: Record<string, "sourced"|"active"|"sold"|"shipped"> = { Sourced: "sourced", "Active on Fleek": "active", Sold: "sold", Shipped: "shipped" };
  return <Badge variant={m[status] || "default"}>{status}</Badge>;
}

export function ConditionBadge({ condition }: { condition: string }) {
  const m: Record<string, "gradeA"|"gradeB"|"gradeC"|"gradeAB"|"gradeBC"|"gradeABC"> = { A: "gradeA", B: "gradeB", C: "gradeC", AB: "gradeAB", BC: "gradeBC", ABC: "gradeABC" };
  return <Badge variant={m[condition] || "default"}>{condition}</Badge>;
}

export { Badge, badgeVariants };
