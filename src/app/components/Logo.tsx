import * as React from 'react';

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 25"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <text
      x="0"
      y="20"
      fontFamily="Inter, sans-serif"
      fontSize="24"
      fontWeight="bold"
      fill="currentColor"
    >
      UXUA
    </text>
  </svg>
);

export { Logo };
