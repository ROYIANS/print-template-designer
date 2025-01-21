console.log('开始校验提交文件')

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execSync } = require('child_process')
// 获取暂存区所有文件路径
const stagedFiles = execSync('git diff --staged --name-only', { encoding: 'utf-8' }).split('\n').filter(Boolean)
// 检查每个路径的每一级目录和文件名主体（不含扩展名）
const invalidSegments = []
stagedFiles.forEach(filePath => {
  // 拆分路径为各层级（目录和文件）
  const segments = filePath.split('/')
  segments.forEach(segment => {
    // 分离文件名主体和扩展名（如果是文件）
    let namePart = segment
    const lastDotIndex = segment.lastIndexOf('.')
    // 如果是文件且有扩展名，则去掉扩展名
    if (lastDotIndex > 0) {
      namePart = segment.substring(0, lastDotIndex)
    }
    // 检查名称主体是否以 New 结尾（不区分大小写）
    if (/New$/i.test(namePart)) {
      invalidSegments.push(`${filePath} → 违规名称: ${segment}`)
    }
  })
})
// 输出结果
if (invalidSegments.length > 0) {
  console.error(`
❌ 禁止提交包含名称主体以 "New" 结尾的文件/目录：
${invalidSegments.join('\n')}
命名规范：
1. 文件示例：错误 → UserNew.vue，正确 → UserAvatar.vue
2. 目录示例：错误 → utilsNew，正确 → utils-auth
  `)
  process.exit(1)
}
