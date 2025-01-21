import _Designer from './designer.vue';
import withInstall from '@/utils/withInstall';
import type { DesignerProps } from './type'

export * from './type';
export type PtdDesignerProps = DesignerProps;

export const PtdDesigner = withInstall(_Designer);
export default PtdDesigner;
