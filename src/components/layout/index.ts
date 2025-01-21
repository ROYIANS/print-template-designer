import _DesignerLayout from './designer-layout.vue';
import withInstall from '@/utils/withInstall';
import type { LayoutProps } from './type';

import './style'

export * from './type';
export type PtdLayoutProps = LayoutProps;

export const PtdDesignerLayout = withInstall(_DesignerLayout);
export default PtdDesignerLayout;
