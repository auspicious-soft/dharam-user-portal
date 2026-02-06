import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  const [checked, setChecked] = React.useState(true)

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
        "relative peer inline-flex w-[30px] h-[30px] shrink-0 cursor-pointer items-center rounded-xl border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
    >
      {/* Labels */}
      <div className={cn(
          "absolute left-0 text-[10px] font-medium text-white transition-opacity rounded-lg  w-[30px] h-[30px] bg-[#0a4ba8] flex items-center justify-center",
          checked ? "opacity-0" : "opacity-100"
        )}
      >
        <span className="border border-white rounded-[4px] text-[8px] font-medium w-4 h-4 flex items-center justify-center">Off</span>
      </div>
      <div
        className={cn(
          "absolute right-0 text-[10px] font-medium text-white transition-opacity rounded-lg  w-[30px] h-[30px]  bg-[#6aa56d] flex items-center justify-center",
          checked ? "opacity-100" : "opacity-0"
        )}
      >
        <span className="border border-white rounded-[4px] text-[8px] font-medium w-4 h-4 flex items-center justify-center">On</span>
      </div>

    </SwitchPrimitives.Root>
  )
})

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
