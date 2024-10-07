This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Eslint

To check for any Code quality errors run

```bash
npm run lint
```

To fix any Code quality errors run

```bash
npm run lint-fix
```

it is added to pre commit hooks

for ignoring lines in ts use following comment

```bash
// prettier-ignore
```

for ignoring lines in jsx use following comment

```bash
{/* prettier-ignore */}
```

to change any rules and extends change .eslintrc file from [Rules list](https://eslint.org/docs/latest/rules/)

to exclude any files or folders change .eslintrc file

## Prettier

To check for any formatting errors run

```bash
npm run check
```

To fix any formatting errors run

```bash
npm run format
```

prettier is also added to liters

and it is also added pre commit hooks alongside linters

for ignoring lines in ts use following comment

```bash
// eslint-disable-next-line rule-name
```

to change any options change .prettierrc file from [Options list](https://prettier.io/docs/en/options)

to exclude any files or folders change .prettierignore file

## Husky

pre commit hook first lints then creates the docs and adds them to git