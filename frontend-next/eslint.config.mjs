import nextVitals from 'eslint-config-next/core-web-vitals';
export default [
  ...nextVitals,
  {ignores:['.next/**','out/**']},
  {rules:{'react-hooks/set-state-in-effect':'warn','react/no-unescaped-entities':'off','@next/next/no-img-element':'off'}}
];
