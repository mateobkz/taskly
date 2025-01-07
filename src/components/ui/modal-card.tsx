import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { X } from "lucide-react"
import { Button } from "./button"

interface ModalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  onClose?: () => void
  className?: string
  children: React.ReactNode
}

const ModalCard = React.forwardRef<HTMLDivElement, ModalCardProps>(
  ({ title, onClose, className, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "w-full max-w-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          className
        )}
        {...props}
      >
        <CardHeader className="relative">
          <CardTitle className="pr-8">{title}</CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full hover:bg-accent"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    )
  }
)
ModalCard.displayName = "ModalCard"

export { ModalCard }