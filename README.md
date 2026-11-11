# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```


Used Aiven for Postgres. It sign server certificates with their
 * own CA. Provide that CA (PEM contents) in
 * DATABASE_CA_CERT so the server is verified instead of trusting it blindly