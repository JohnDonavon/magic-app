import React from 'react';
import { SvgProps } from 'react-native-svg';
import { areAllPropsEqual } from '../utils/helpers';

// Import SVG files
import HomeIcon from '../../assets/icons/home.svg';
import SearchIcon from '../../assets/icons/search.svg';
import ArchiveIcon from '../../assets/icons/archive.svg';
import CardsBlankIcon from '../../assets/icons/cards-blank.svg';
import CameraIcon from '../../assets/icons/camera.svg';

export enum IconNames {
  'home',
  'search',
  'archive',
  'cards-blank',
  'camera',
}

export type IconNamesUnion = keyof typeof IconNames;

export interface IconProps extends SvgProps {
  name: IconNamesUnion;
  color?: string;
  size?: number;
}

const Icon = React.memo(({ name, color, size, ...rest }: IconProps) => {
  if (color !== undefined && rest.fill === undefined) {
    rest.fill = color;
  }

  if (size !== undefined) {
    rest.width = size;
    rest.height = size;
  }

  switch (name) {
    case 'home':
      return <HomeIcon {...rest} />;
    case 'search':
      return <SearchIcon {...rest} />;
    case 'archive':
      return <ArchiveIcon {...rest} />;
    case 'cards-blank':
      return <CardsBlankIcon {...rest} />;
    case 'camera':
      return <CameraIcon {...rest} />;
    default:
      return null;
  }
}, areAllPropsEqual);

Icon.displayName = 'Icon';

export default Icon; 