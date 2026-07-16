import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
const bv = cva("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium", {
  variants: { variant: {
    default: "bg-[--c-surface-2] text-[--c-text-2]",
    sourced: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    sold: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    shipped: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
    gradeA: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    gradeB: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    gradeC: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
    gradeAB: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400",
    gradeBC: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    gradeABC: "bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400",
  }}, defaultVariants: { variant: "default" }
});
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof bv> {}
function Badge({ className, variant, ...props }: BadgeProps) { return <div className={cn(bv({ variant }), className)} {...props} />; }
export function StatusBadge({ status }: { status: string }) { const m: Record<string, "sourced"|"active"|"sold"|"shipped"> = { Sourced:"sourced","Active on Fleek":"active",Sold:"sold",Shipped:"shipped" }; return <Badge variant={m[status]||"default"}>{status}</Badge>; }
export function ConditionBadge({ condition }: { condition: string }) { const m: Record<string, "gradeA"|"gradeB"|"gradeC"|"gradeAB"|"gradeBC"|"gradeABC"> = { A:"gradeA",B:"gradeB",C:"gradeC",AB:"gradeAB",BC:"gradeBC",ABC:"gradeABC" }; return <Badge variant={m[condition]||"default"}>{condition}</Badge>; }
export { Badge, bv as badgeVariants };
