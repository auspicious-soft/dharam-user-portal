import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const SwitchOrignial = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  const [checked, setChecked] = React.useState(false)

  return (
    <SwitchPrimitives.Root
      {...props}
      checked={checked}
      onCheckedChange={(state) => {
        setChecked(state)
        if (props.onCheckedChange) props.onCheckedChange(state)
      }}
      ref={ref}
      className={cn(
        "relative peer inline-flex w-[54px] h-[24px] shrink-0 cursor-pointer items-center rounded-full border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-Black_light data-[state=unchecked]:bg-paragraph",
        className
      )}
    >
      {/* Thumb */}
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-[26px] rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-0px)] data-[state=unchecked]:translate-x-[2px]"
        )}
      />
    </SwitchPrimitives.Root>
  )
})

SwitchOrignial.displayName = SwitchPrimitives.Root.displayName

export { SwitchOrignial }
