import { font } from '@/assets/font/lxgw-normal'

export function addFont(pdf) {
  pdf.addFileToVFS('lxgw', font)
  return true
}
