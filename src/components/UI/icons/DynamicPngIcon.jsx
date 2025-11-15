import groupIcon from '../../../assets/group.jpg'
import defaultImageProfile from '../../../assets/default_image_profile.jpg'
import notifyIcon from '../../../assets/notify.svg'
import notifyActiveIcon from '../../../assets/notify_active.svg'
import deleteBucketIcon from '../../../assets/delete-24.png'

const iconMap = {
    groupIcon: groupIcon,
    defaultImageProfile: defaultImageProfile,
    notifyIcon: notifyIcon,
    notifyActiveIcon: notifyActiveIcon,
    deleteBucketIcon: deleteBucketIcon,
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