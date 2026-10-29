import * as React from 'react';
import { Context } from '../../Context';

export const AssetDetailsLink = ({
  path,
  onClick,
  className = ''
}: {
  path: string;
  onClick: () => void;
  className?: string;
}) => {
  const context = React.useContext(Context);
  const href = `${context?.team?.slug ? `/${context.team.slug}` : ''}/${path}`;

  return (
    <a
      href={href}
      className={`link link-hover font-semibold ${className}`}
      onClick={event => {
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        onClick();
      }}
    >
      Details
    </a>
  );
};
