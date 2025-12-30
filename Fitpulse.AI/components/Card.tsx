import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, action, icon }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col ${className}`}>
      {(title || action || icon) && (
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary-600">{icon}</div>}
            {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  );
};

export default Card;