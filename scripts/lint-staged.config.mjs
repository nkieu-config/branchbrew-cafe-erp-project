import path from 'node:path';

/** @type {(workspace: string, extraArgs?: string) => import('lint-staged').Command} */
const eslintStaged =
  (workspace, extraArgs = '') =>
  (filenames) => {
    if (filenames.length === 0) return [];

    const files = filenames
      .map((file) => `"${path.relative(workspace, file)}"`)
      .join(' ');

    return `cd ${workspace} && npx eslint --fix ${extraArgs} ${files}`.trim();
  };

/** @type {import('lint-staged').Configuration} */
export default {
  'frontend/**/*.{ts,tsx}': [
    eslintStaged('frontend', '--max-warnings=0'),
    () => 'npm run type-check --prefix frontend',
  ],
  'backend/**/*.ts': [
    eslintStaged('backend', '--max-warnings=0'),
    () => 'npm run type-check --prefix backend',
  ],
};
