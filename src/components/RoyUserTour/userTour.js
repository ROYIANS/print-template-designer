/*
 * @Author: ROYIANS
 * @Date: 2022/4/18 14:55
 * @Description:
 */
import Shepherd from 'shepherd.js'
import defaultConfig from './default-config'

import './driver.scss'

const shepherd = (props = {}) => {
  const newProps = {
    ...defaultConfig,
    ...props
  }
  return new Shepherd.Tour(newProps)
}

export default shepherd
