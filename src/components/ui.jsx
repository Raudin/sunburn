import React from 'react';

export function Card({ className = '', children, ...props }) {
  return <section className={`ui-card ${className}`} {...props}>{children}</section>;
}

export function Button({ className = '', variant = 'default', children, ...props }) {
  return <button className={`ui-button ui-button-${variant} ${className}`} {...props}>{children}</button>;
}

export function Input({ className = '', ...props }) {
  return <input className={`ui-input ${className}`} {...props} />;
}

export function Badge({ className = '', variant = 'muted', children, ...props }) {
  return <span className={`ui-badge ui-badge-${variant} ${className}`} {...props}>{children}</span>;
}

export function SectionLabel({ icon: Icon, htmlFor, children }) {
  const Tag = htmlFor ? 'label' : 'div';
  return <Tag className="ui-section-label" htmlFor={htmlFor}><Icon size={15} strokeWidth={2.2} />{children}</Tag>;
}
