import clsx from 'clsx';

const baseClasses =
  'input-editorial w-full bg-transparent text-sm placeholder:text-ink-muted focus:ring-primary-indigo focus:border-primary-indigo';

function Input({ className, ...props }) {
  return <input className={clsx(baseClasses, className)} {...props} />;
}

export default Input;
