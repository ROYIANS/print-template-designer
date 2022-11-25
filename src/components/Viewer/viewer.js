/*
 * @Author: ROYIANS
 * @Date: 2022/11/25 15:44
 * @Description:
 * @sign:
 * ╦═╗╔═╗╦ ╦╦╔═╗╔╗╔╔═╗
 * ╠╦╝║ ║╚╦╝║╠═╣║║║╚═╗
 * ╩╚═╚═╝ ╩ ╩╩ ╩╝╚╝╚═╝
 */
import { AutoRender } from '@/components/Viewer/auto-render'

export async function generateViewerElement(
  componentData,
  pagerConfig,
  dataSource,
  dataSet,
  tempHolder
) {
  const renderer = new AutoRender({
    renderElements: componentData,
    pagerConfig,
    dataSet,
    dataSource,
    tempHolder
  })
  return await renderer.run()
}
