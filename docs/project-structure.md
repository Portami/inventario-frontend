# Project Structure

## `src/components`

Reusable UI building blocks belong here.

Examples:

- buttons
- cards
- modals
- form inputs
- navigation elements

Use `components` for pieces of UI that can be reused in multiple places.

A component should usually:

- do one thing well
- be reusable
- receive data through props
- avoid containing page-level business logic unless necessary

---

## `src/pages`

Page-level components belong here.

Examples:

- Home page
- Login page
- Dashboard page
- Settings page

A page usually:

- represents a route or screen
- combines multiple components together
- handles page-specific logic and layout
- should not contain too much duplicated UI code

If something inside a page becomes reusable, move it into `components`.

---

## `src/types`

Shared TypeScript types and interfaces belong here.

Examples:

- API response types
- shared DTOs
- utility types
- app-wide interfaces

Use this folder when:

- a type is used in more than one file
- a type is important enough to centralize
- you want to keep large type definitions out of component files

Keep small, local-only types close to the component that uses them.

---

## `src/theme.ts`

Use `theme.ts` for **design tokens** and shared styling values that should stay consistent across the app.

Examples:

- colors
- spacing values
- font sizes
- breakpoints
- z-index layers
- border radius values
- reusable theme constants

Use `theme.ts` when a value is:

- used in multiple places
- part of the visual design system
- something that should stay consistent everywhere

Example:

```ts
export const theme = {
    colors: {
        primary: '#0057ff',
        danger: '#d92d20',
        text: '#101828',
    },
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
    },
};
```
