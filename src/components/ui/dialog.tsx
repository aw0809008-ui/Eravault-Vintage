"use client";
import * as React from "react";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const Dialog = D.Root; const DialogTrigger = D.Trigger; const DialogPortal = D.Portal; const DialogClose = D.Close;
const DialogOverlay = React.forwardRef<React.ComponentRef<typeof D.Overlay>, React.ComponentPropsWithoutRef<typeof D.Overlay>>(({ className, ...props }, ref) => (
  <D.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} />
));
DialogOverlay.displayName = D.Overlay.displayName;
const DialogContent = React.forwardRef<React.ComponentRef<typeof D.Content>, React.ComponentPropsWithoutRef<typeof D.Content>>(({ className, children, ...props }, ref) => (
  <DialogPortal><DialogOverlay /><D.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border border-[--c-border] bg-[--c-surface] p-6 shadow-2xl rounded-xl max-h-[90vh] overflow-y-auto", className)} {...props}>{children}<D.Close className="absolute right-4 top-4 p-1 rounded-md text-[--c-text-3] hover:text-[--c-text] hover:bg-[--c-hover] transition-colors cursor-pointer"><X className="h-4 w-4" /></D.Close></D.Content></DialogPortal>
));
DialogContent.displayName = D.Content.displayName;
const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1 sm:text-left", className)} {...props} />;
const DialogTitle = React.forwardRef<React.ComponentRef<typeof D.Title>, React.ComponentPropsWithoutRef<typeof D.Title>>(({ className, ...props }, ref) => <D.Title ref={ref} className={cn("text-base font-semibold text-[--c-text]", className)} {...props} />);
DialogTitle.displayName = D.Title.displayName;
const DialogDescription = React.forwardRef<React.ComponentRef<typeof D.Description>, React.ComponentPropsWithoutRef<typeof D.Description>>(({ className, ...props }, ref) => <D.Description ref={ref} className={cn("text-[13px] text-[--c-text-3]", className)} {...props} />);
DialogDescription.displayName = D.Description.displayName;
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription };
