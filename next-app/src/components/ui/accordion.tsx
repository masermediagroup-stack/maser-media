"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

type AccordionContextValue = {
  value: string[]
  setValue: (value: string[]) => void
}

type AccordionItemContextValue = {
  contentId: string
  open: boolean
  triggerId: string
  toggle: () => void
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)
const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null)

type AccordionProps = Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> & {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

function Accordion({
  className,
  value,
  defaultValue = [],
  onValueChange,
  ...props
}: AccordionProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const currentValue = value ?? uncontrolledValue

  const setValue = React.useCallback(
    (nextValue: string[]) => {
      if (value === undefined) {
        setUncontrolledValue(nextValue)
      }
      onValueChange?.(nextValue)
    },
    [onValueChange, value],
  )

  return (
    <AccordionContext.Provider value={{ value: currentValue, setValue }}>
      <div data-slot="accordion" className={cn("w-full", className)} {...props} />
    </AccordionContext.Provider>
  )
}

type AccordionItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string
  onOpenChange?: (open: boolean) => void
}

function AccordionItem({
  className,
  value,
  onOpenChange,
  children,
  ...props
}: AccordionItemProps) {
  const accordion = React.useContext(AccordionContext)
  if (!accordion) {
    throw new Error("AccordionItem must be used within Accordion")
  }

  const reactId = React.useId()
  const open = accordion.value.includes(value)
  const triggerId = `accordion-trigger-${reactId}`
  const contentId = `accordion-content-${reactId}`

  const toggle = React.useCallback(() => {
    const nextOpen = !open
    accordion.setValue(nextOpen ? [value] : [])
    onOpenChange?.(nextOpen)
  }, [accordion, onOpenChange, open, value])

  return (
    <AccordionItemContext.Provider value={{ contentId, open, triggerId, toggle }}>
      <div
        data-slot="accordion-item"
        data-state={open ? "open" : "closed"}
        className={cn("border-b", className)}
        {...props}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

type AccordionTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>

function AccordionTrigger({
  className,
  children,
  onClick,
  ...props
}: AccordionTriggerProps) {
  const item = React.useContext(AccordionItemContext)
  if (!item) {
    throw new Error("AccordionTrigger must be used within AccordionItem")
  }

  return (
    <h3 className="flex">
      <button
        id={item.triggerId}
        type="button"
        data-slot="accordion-trigger"
        data-state={item.open ? "open" : "closed"}
        data-panel-open={item.open ? "" : undefined}
        aria-controls={item.contentId}
        aria-expanded={item.open}
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none hover:underline focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        onClick={(event) => {
          onClick?.(event)
          if (!event.defaultPrevented) {
            item.toggle()
          }
        }}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden
          className={cn(
            "accordion-chevron size-4 shrink-0",
            item.open && "accordion-chevron--open",
          )}
        />
      </button>
    </h3>
  )
}

type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>

function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  const item = React.useContext(AccordionItemContext)
  if (!item) {
    throw new Error("AccordionContent must be used within AccordionItem")
  }

  return (
    <div
      id={item.contentId}
      role="region"
      data-slot="accordion-content"
      data-state={item.open ? "open" : "closed"}
      data-open={item.open ? "" : undefined}
      aria-labelledby={item.triggerId}
      aria-hidden={!item.open}
      className={cn("grid overflow-hidden text-sm", className)}
      {...props}
    >
      <div data-slot="accordion-content-inner" className="min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
