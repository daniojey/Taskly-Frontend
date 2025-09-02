import groupIcon from '../../../assets/group.jpg'

const iconMap = {
    groupIcon: groupIcon
}

const DynamicPngIcon = ({
  iconName, // Имя файла иконки (без расширения)
  alt = 'icon',
  height = 24,
  width = 24,
  className = '',
  ...restProps
}) => {
  // Импорт иконки из assets
  const iconSrc = iconMap[iconName];

  if (!iconSrc) {
    console.error(`Иконка "${iconName}" не найдена!`);
    return null;
  }

  return (
    <img
      src={iconSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${className}`}
      {...restProps}
    />
  );
};

export default DynamicPngIcon;