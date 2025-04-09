import { isEqual } from 'lodash';

export const areAllPropsEqual = (prevProps: any, nextProps: any) =>
  isEqual(prevProps, nextProps); 