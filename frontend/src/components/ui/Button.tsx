import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost' | 'link';
  tooltip?: string;
  href?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  size = 'md',
  variant = 'primary',
  tooltip,
  href,
  ...props
}) => {
  // Base styles
  const baseStyles = "relative group inline-flex flex-col items-center justify-center font-medium transition-all duration-300 ease-in-out cursor-pointer";
  
  // Size styles
  const sizeStyles = {
    sm: "text-sm px-3 py-1.5",
    md: "text-base px-6 py-3",
    lg: "text-lg px-8 py-4",
  };

  // Variant styles
  const variantStyles = {
    primary: "text-black bg-transparent border-none", // Underline style
    outline: "text-black bg-white border border-black hover:bg-gray-100 rounded-lg", // Frame style
    ghost: "text-gray-600 hover:text-black bg-transparent border-none",
    link: "text-blue-500 hover:text-blue-700 underline-offset-4 hover:underline bg-transparent border-none",
  };

  // Underline styles
  const showUnderline = variant === 'primary' || variant === 'ghost';
  
  const underlineStyles = "h-0.5 bg-current mt-1 transition-all duration-300";
  const underlineWidths = {
    sm: "w-full",
    md: "w-full",
    lg: "w-full",
  };

  // Tooltip positioning
  // We want the tooltip to be 4px (mt-1 equivalent) below the line.
  // For primary/ghost, the line is inside the padding.
  // For outline, the line is the bottom border.
  const tooltipBottomOffsets = {
    primary: {
      sm: "bottom-[2px]",  // py-1.5 (6px) - 4px = 2px
      md: "bottom-[8px]",  // py-3 (12px) - 4px = 8px
      lg: "bottom-[12px]", // py-4 (16px) - 4px = 12px
    },
    ghost: {
      sm: "bottom-[2px]",
      md: "bottom-[8px]",
      lg: "bottom-[12px]",
    },
    outline: {
      sm: "bottom-[-4px]", // 0px - 4px = -4px
      md: "bottom-[-4px]",
      lg: "bottom-[-4px]",
    },
    link: {
        sm: "bottom-[2px]",
        md: "bottom-[8px]",
        lg: "bottom-[12px]",
    }
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  const content = (
    <>
      <span className="flex flex-col items-center">
        <span>{children}</span>
        {showUnderline && (
          <span className={`${underlineStyles} ${underlineWidths[size]} block`}></span>
        )}
      </span>
      
      {tooltip && (
        <div className={`absolute left-1/2 transform -translate-x-1/2 ${tooltipBottomOffsets[variant][size]} translate-y-[120%] opacity-0 group-hover:translate-y-full group-hover:opacity-100 transition-all duration-300 ease-in-out pointer-events-none z-10`}>
          <div className="text-black text-xs py-1 px-2 whitespace-nowrap font-medium">
            {tooltip}
          </div>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClassName} {...props}>
      {content}
    </button>
  );
};

export default Button;
