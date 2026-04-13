import groupIcon from '../../../assets/group.jpg'
import defaultImageProfile from '../../../assets/default_image_profile.jpg'
import notifyIcon from '../../../assets/notify.svg'
import notifyActiveIcon from '../../../assets/notify_active.svg'
import deleteBucketIcon from '../../../assets/delete-24.png'
import filtersIcon from '../../../assets/filters-icon.png'
import arrowDownWhite from '../../../assets/arrow_down_white.png'
import clipsFile from '../../../assets/clips_file.png'
import downloadIcon from '../../../assets/download_icon.png'
import backGroundIcon from  '../../../assets/blue_background.png'
import settingsIcon from '../../../assets/settings_icon.png'
import statisticIcon from "../../../assets/statistic_icon.png"
import kidStarHollow from '../../../assets/kid_star_hollow.png'
import kidStar from '../../../assets/kid_star.png'

// Stratagems Icons
import stratagemArrowDown from '../../../assets/arrow_dow.png'
import stratagemArrowUp from '../../../assets/arrow_up.png'
import stratagemArrowLeft from '../../../assets/arrow_left.png'
import stratagemArrowRight from '../../../assets/arrow_right.png'
import activeArrowUp from '../../../assets/active_arrow_up.png'
import activeArrowDown from '../../../assets/active_arrow_down.png'
import activeArrowLeft from '../../../assets/active_arrow_left.png'
import activeArrowRight from '../../../assets/active_arrow_right.png'
import deactivateArrowUp from '../../../assets/deactive_arrow_up.png'
import deactivateArrowDown from '../../../assets/deactive_arrow_down.png'
import deactivateArrowLeft from '../../../assets/deactive_arrow_left.png'
import deactivateArrowRight from '../../../assets/deactive_arrow_right.png'


const iconMap = {
    groupIcon: groupIcon,
    defaultImageProfile: defaultImageProfile,
    notifyIcon: notifyIcon,
    notifyActiveIcon: notifyActiveIcon,
    deleteBucketIcon: deleteBucketIcon,
    filtersIcon: filtersIcon,
    arrowDownWhite: arrowDownWhite,
    clipsFile: clipsFile,
    downloadIcon: downloadIcon,
    backGroundIcon: backGroundIcon,
    settingsIcon: settingsIcon,
    statisticIcon: statisticIcon,
    kidStarHollow: kidStarHollow,
    kidStar: kidStar,
    stratagemArrow_down: stratagemArrowDown,
    stratagemArrow_up: stratagemArrowUp,
    stratagemArrow_left: stratagemArrowLeft,
    stratagemArrow_right: stratagemArrowRight,
    activeStratagemArrow_up: activeArrowUp,
    activeStratagemArrow_down: activeArrowDown,
    activeStratagemArrow_left: activeArrowLeft,
    activeStratagemArrow_right: activeArrowRight,
    deactiveStratagemArrow_up: deactivateArrowUp,
    deactiveStratagemArrow_down: deactivateArrowDown,
    deactiveStratagemArrow_left: deactivateArrowLeft,
    deactiveStratagemArrow_right: deactivateArrowRight,
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