interface MaterialSymbolProps {
  icon: string;
  className?: string;
  filled?: boolean;
}

export function MaterialSymbol({ icon, className = "", filled = false }: MaterialSymbolProps) {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={{ 
        fontVariationSettings: filled ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" : undefined 
      }}
    >
      {icon}
    </span>
  );
}