import clsx from 'clsx';

function Card({ as = 'div', className, children, ...props }) {
  const Component = as;
  return (
    <Component
      className={clsx(
        'glass-panel border border-white/10 bg-academic-bg/60 p-6 shadow-glass backdrop-blur-2xl',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Card;
