import React from 'react';
import clsx from 'clsx';
import DownloadButton from '@components/DownloadButton';

export default function DownloadButtonNavbarItem({
  className,
  ...props
}) {
  return (
    <div className={clsx('navbar__item', className)} {...props}>
      <DownloadButton />
    </div>
  );
}
