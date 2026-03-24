export const clerkAppearance = {
  cssLayerName: "clerk",
  theme: "simple",
  layout: {
    socialButtonsPlacement: "bottom",
    socialButtonsVariant: "blockButton",
  },
  variables: {
    colorPrimary: "var(--foreground)",
    colorText: "var(--foreground)",
    colorTextSecondary: "color-mix(in oklch, var(--foreground) 62%, white)",
    colorBackground: "var(--card)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorNeutral: "var(--muted)",
    colorDanger: "var(--destructive)",
    borderRadius: "1.5rem",
    fontFamily: 'var(--app-font-sans)',
  },
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "rounded-[1.5rem] border border-border/70 bg-card/90 p-6 shadow-none",
    navbar: "hidden",
    headerTitle: "text-2xl font-semibold tracking-tight text-foreground",
    headerSubtitle: "mt-2 text-sm leading-6 text-muted-foreground",
    socialButtonsBlockButton:
      "h-11 rounded-xl border border-border bg-background text-sm font-medium text-foreground shadow-none transition-colors hover:bg-muted",
    socialButtonsBlockButtonText: "font-medium text-foreground",
    dividerLine: "bg-border",
    dividerText:
      "px-3 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase",
    formFieldLabel:
      "mb-2 text-sm font-medium tracking-tight text-foreground",
    formFieldInput:
      "h-11 rounded-xl border border-border bg-background text-foreground shadow-none transition-colors placeholder:text-muted-foreground focus:border-foreground/25 focus:ring-2 focus:ring-ring/30",
    formButtonPrimary:
      "h-11 rounded-xl bg-foreground text-sm font-medium text-background shadow-none transition-all hover:bg-foreground/90",
    footerActionText: "text-sm text-muted-foreground",
    footerActionLink:
      "font-medium text-foreground underline decoration-border underline-offset-4 hover:text-foreground/80",
    formResendCodeLink:
      "font-medium text-foreground underline decoration-border underline-offset-4 hover:text-foreground/80",
    identityPreviewText: "text-sm text-foreground",
    identityPreviewEditButton:
      "font-medium text-foreground underline decoration-border underline-offset-4 hover:text-foreground/80",
    otpCodeFieldInput:
      "size-11 rounded-xl border border-border bg-background text-foreground shadow-none",
    formFieldSuccessText: "text-sm text-foreground",
    formFieldWarningText: "text-sm text-destructive",
    alertText: "text-sm",
    alertClerkError: "rounded-xl border border-destructive/20 bg-destructive/10",
    alertClerkErrorText: "text-destructive",
    alternativeMethodsBlockButton:
      "rounded-xl border border-border bg-background text-foreground hover:bg-muted",
  },
} as const;
