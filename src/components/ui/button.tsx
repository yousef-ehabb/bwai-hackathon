import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border-2 border-transparent bg-clip-padding font-display font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-85",
        outline:
          "border-primary bg-transparent text-primary hover:bg-primary/5",
        secondary:
          "bg-secondary text-secondary-foreground hover:opacity-85 border-transparent",
        ghost:
          "hover:bg-muted hover:text-foreground border-transparent",
        destructive:
          "bg-danger text-white hover:opacity-85 border-transparent",
        link: "text-primary underline-offset-4 hover:underline border-transparent px-0!",
        ghostDark: 
          "bg-white/10 text-white border-white/20 hover:bg-white/20",
      },
      size: {
        default: "py-[14px] px-[32px] text-[18px]",
        sm: "py-[10px] px-[24px] text-[16px]",
        lg: "py-[16px] px-[40px] text-[20px]",
        icon: "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
