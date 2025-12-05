import clsx from 'clsx';

const baseStyles =
  'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-academic-bg';

const variants = {
  primary: 'bg-primary-indigo text-white hover:bg-primary-indigo-strong',
  ghost: 'bg-transparent text-ink-strong border border-glass-border hover:border-primary-indigo/60',
};

function Button({ as = 'button', variant = 'primary', className, children, ...props }) {
  const Component = as;
  return (
    <Component className={clsx(baseStyles, variants[variant], className)} {...props}>
      {children}
    </Component>
  );
}

export default Button;
