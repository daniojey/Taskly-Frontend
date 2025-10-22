import React from 'react';

const DynamicSvgIcon = ({
  children,      // SVG-элементы (пути, фигуры)
  color = 'currentColor', // Цвет по умолчанию (наследуется из CSS)
  size = 24,     // Размер по умолчанию
  viewBox = '0 0 24 24', // ViewBox по умолчанию
  className = '', // Дополнительные классы
  style,         // Кастомные стили
  ...props       // Остальные пропсы
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill={color}
      className={`svg-icon ${className}`}
      style={style}
      role="img"
      {...props}
    >
      {children}
    </svg>
  );
};

export default DynamicSvgIcon;