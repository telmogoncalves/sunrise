import { amber, emerald, fuchsia, indigo, orange, rose, sky, slate } from 'tailwindcss/colors'

export const ThemeColors: {
  [key: string]: string
} = {
  rose: `
    --brand-50: ${rose[50]};
    --brand-500: ${rose[500]};
    --brand-700: ${rose[700]};
  `,
  amber: `
    --brand-50: ${amber[50]};
    --brand-500: ${amber[500]};
    --brand-700: ${amber[700]};
  `,
  orange: `
    --brand-50: ${orange[50]};
    --brand-500: ${orange[500]};
    --brand-700: ${orange[700]};
  `,
  fuchsia: `
    --brand-50: ${fuchsia[50]};
    --brand-500: ${fuchsia[500]};
    --brand-700: ${fuchsia[700]};
  `,
  indigo: `
    --brand-50: ${indigo[50]};
    --brand-500: ${indigo[500]};
    --brand-700: ${indigo[700]};
  `,
  sky: `
    --brand-50: ${sky[50]};
    --brand-500: ${sky[500]};
    --brand-700: ${sky[700]};
  `,
  slate: `
    --brand-50: ${slate[50]};
    --brand-500: ${slate[500]};
    --brand-700: ${slate[700]};
  `,
  emerald: `
    --brand-50: ${emerald[50]};
    --brand-500: ${emerald[500]};
    --brand-700: ${emerald[700]};
  `,
}
