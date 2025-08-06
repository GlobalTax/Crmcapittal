import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

// Heading variants with consistent typography hierarchy
const headingVariants = cva(
  "font-semibold tracking-tight leading-tight",
  {
    variants: {
      variant: {
        h1: "text-lg font-semibold text-gray-900",
        h2: "text-base font-medium text-gray-600",
        h3: "text-sm font-semibold text-gray-900",
        h4: "text-sm font-medium text-gray-600",
        h5: "text-sm font-normal text-gray-500",
        h6: "text-xs font-normal text-gray-500"
      },
      color: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        destructive: "text-destructive",
        success: "text-success"
      }
    },
    defaultVariants: {
      variant: "h1",
      color: "default"
    }
  }
);

const textVariants = cva(
  "leading-relaxed",
  {
    variants: {
      variant: {
        body: "text-base text-gray-900",
        small: "text-sm text-gray-500",
        xs: "text-xs text-gray-500",
        large: "text-lg text-gray-900"
      },
      color: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        destructive: "text-destructive",
        success: "text-success"
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold"
      }
    },
    defaultVariants: {
      variant: "body",
      color: "default",
      weight: "normal"
    }
  }
);

interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">, VariantProps<typeof headingVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

interface TextProps extends Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">, VariantProps<typeof textVariants> {
  as?: "p" | "span" | "div";
}

// Heading component
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant, color, as, ...props }, ref) => {
    const Comp = as || (variant === "h1" ? "h1" : variant === "h2" ? "h2" : variant === "h3" ? "h3" : variant === "h4" ? "h4" : variant === "h5" ? "h5" : "h6") as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ variant, color, className }))}
        {...props}
      />
    );
  }
);

Heading.displayName = "Heading";

// Text component
export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant, color, weight, as = "p", ...props }, ref) => {
    const Comp = as as "p" | "span" | "div";
    
    return (
      <Comp
        ref={ref}
        className={cn(textVariants({ variant, color, weight, className }))}
        {...props}
      />
    );
  }
);

Text.displayName = "Text";

// Convenient shorthand components
export const H1 = (props: Omit<HeadingProps, "variant">) => 
  <Heading variant="h1" {...props} />;

export const H2 = (props: Omit<HeadingProps, "variant">) => 
  <Heading variant="h2" {...props} />;

export const H3 = (props: Omit<HeadingProps, "variant">) => 
  <Heading variant="h3" {...props} />;

export const H4 = (props: Omit<HeadingProps, "variant">) => 
  <Heading variant="h4" {...props} />;

export const PageTitle = (props: Omit<HeadingProps, "variant">) => 
  <Heading variant="h1" {...props} />;

export const SectionTitle = (props: Omit<HeadingProps, "variant">) => 
  <Heading variant="h2" {...props} />;

export const CardTitle = (props: Omit<HeadingProps, "variant">) => 
  <Heading variant="h3" {...props} />;