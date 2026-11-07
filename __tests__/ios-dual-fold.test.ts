/**
 * iPhone Duo 双折识别回归测试
 *
 * 上游化自 RNModules patches/@hecom+react-native-foldable+1.5.0.patch
 * （MR !1890 / Task 71224542 iOS 折叠屏适配，2026-11 Duo 三姿态实测产出）
 *
 * patch 原文改的是编译产物 lib/*.js，本测试按语义在 src 源码层验证：
 * 1. isFoldableBehavior：iOS 双折设备 window(内屏)/screen(外屏) 宽度差 ≥ 200pt
 *    冷启动即识别为折叠行为，不依赖宽度跳变历史
 * 2. classifyDeviceType：iOS 排除 TRI_FOLDABLE 误判
 *    （iPhone Duo 内屏 951pt 超 triFoldThreshold=900 被误判为三折）
 */

// mockPlatformState / mockDimensions 必须以 mock 前缀命名，供 jest.mock 工厂引用
const mockPlatformState = { os: 'ios', isPad: false }
const mockDimensions = {
  window: { width: 951, height: 2018 },
  screen: { width: 466, height: 1432 },
}

jest.mock('react-native', () => ({
  Platform: {
    get OS() {
      return mockPlatformState.os
    },
    get isPad() {
      return mockPlatformState.isPad
    },
    select: (o: Record<string, unknown>) => o.ios,
  },
  Dimensions: {
    get: (dim: 'window' | 'screen') => ({
      width: mockDimensions[dim].width,
      height: mockDimensions[dim].height,
      scale: 3,
      fontScale: 1,
    }),
    addEventListener: () => ({ remove: () => {} }),
  },
}))

// IS_PAD/IS_IOS 等平台标志在模块首次加载时固化，按平台分组前必须 resetModules 重载
function loadDetectors() {
  const { dimensionManager } = require('../src/core/DimensionManager')
  const { classifyDeviceType } = require('../src/core/PlatformDetector')
  const { DEFAULT_BREAKPOINTS } = require('../src/core/constants')
  const { DeviceType } = require('../src/types')
  return { dimensionManager, classifyDeviceType, DEFAULT_BREAKPOINTS, DeviceType }
}

const DUO_CLASSIFY_INPUT = {
  windowWidth: 951,
  windowHeight: 2018,
  maxWindowWidth: 951,
  hasFoldableBehavior: true,
  hasTriFoldBehavior: true, // 内屏 951 ≥ triFoldThreshold 900，patch 前会误判 TRI_FOLDABLE
}

describe('iOS iPhone Duo 双折识别（上游化收编 patch !1890）', () => {
  beforeEach(() => {
    jest.resetModules()
    mockPlatformState.os = 'ios'
    mockPlatformState.isPad = false
    mockDimensions.window = { width: 951, height: 2018 } // 内屏（展开态冷启动）
    mockDimensions.screen = { width: 466, height: 1432 } // 外屏
  })

  test('isFoldableBehavior: 冷启动单姿态（内外屏宽差 485pt ≥ 200）即识别为折叠行为', () => {
    const { dimensionManager: dm } = loadDetectors()
    expect(dm.isFoldableBehavior()).toBe(true)
  })

  test('isFoldableBehavior: minUnfoldedWidth 门控仍生效（外屏单态 maxWindowWidth=466 < 600 不识别）', () => {
    mockDimensions.window = { width: 466, height: 1432 } // 外屏态
    mockDimensions.screen = { width: 466, height: 1432 }
    const { dimensionManager: dm } = loadDetectors()
    expect(dm.isFoldableBehavior()).toBe(false)
  })

  test('isFoldableBehavior: 直板 iPhone（内外屏同宽，宽差 0）不识别', () => {
    mockDimensions.window = { width: 390, height: 844 }
    mockDimensions.screen = { width: 390, height: 844 }
    const { dimensionManager: dm } = loadDetectors()
    expect(dm.isFoldableBehavior()).toBe(false)
  })

  test('classifyDeviceType: iPhone Duo 内屏超三折阈值判 FOLDABLE 而非 TRI_FOLDABLE', () => {
    const { classifyDeviceType, DEFAULT_BREAKPOINTS, DeviceType } = loadDetectors()
    const type = classifyDeviceType({
      ...DUO_CLASSIFY_INPUT,
      breakpoints: DEFAULT_BREAKPOINTS,
    })
    expect(type).toBe(DeviceType.FOLDABLE)
    expect(type).not.toBe(DeviceType.TRI_FOLDABLE)
  })

  test('classifyDeviceType: 直板 iPhone 判 PHONE', () => {
    const { classifyDeviceType, DEFAULT_BREAKPOINTS, DeviceType } = loadDetectors()
    const type = classifyDeviceType({
      windowWidth: 390,
      windowHeight: 844,
      maxWindowWidth: 390,
      hasFoldableBehavior: false,
      hasTriFoldBehavior: false,
      breakpoints: DEFAULT_BREAKPOINTS,
    })
    expect(type).toBe(DeviceType.PHONE)
  })
})

describe('iPad 不受 iOS 三折排除影响', () => {
  beforeEach(() => {
    jest.resetModules()
    mockPlatformState.os = 'ios'
    mockPlatformState.isPad = true
    mockDimensions.window = { width: 1024, height: 1366 }
    mockDimensions.screen = { width: 1024, height: 1366 }
  })

  test('classifyDeviceType: iPad 优先判 IPAD', () => {
    const { classifyDeviceType, DEFAULT_BREAKPOINTS, DeviceType } = loadDetectors()
    const type = classifyDeviceType({
      windowWidth: 1024,
      windowHeight: 1366,
      maxWindowWidth: 1024,
      hasFoldableBehavior: true,
      hasTriFoldBehavior: true,
      breakpoints: DEFAULT_BREAKPOINTS,
    })
    expect(type).toBe(DeviceType.IPAD)
  })
})

describe('Android 三折与大屏逻辑不变（上游化零回归）', () => {
  beforeEach(() => {
    jest.resetModules()
    mockPlatformState.os = 'android'
    mockPlatformState.isPad = false
    mockDimensions.window = { width: 1008, height: 2160 } // Mate XT 三折展开
    mockDimensions.screen = { width: 1008, height: 2160 }
  })

  test('classifyDeviceType: Android 三折行为仍判 TRI_FOLDABLE', () => {
    const { classifyDeviceType, DEFAULT_BREAKPOINTS, DeviceType } = loadDetectors()
    const type = classifyDeviceType({
      windowWidth: 1008,
      windowHeight: 2160,
      maxWindowWidth: 1008,
      hasFoldableBehavior: true,
      hasTriFoldBehavior: true,
      breakpoints: DEFAULT_BREAKPOINTS,
    })
    expect(type).toBe(DeviceType.TRI_FOLDABLE)
  })

  test('classifyDeviceType: Android 大屏（无折叠行为）判 TABLET', () => {
    const { classifyDeviceType, DEFAULT_BREAKPOINTS, DeviceType } = loadDetectors()
    const type = classifyDeviceType({
      windowWidth: 800,
      windowHeight: 1280,
      maxWindowWidth: 800,
      hasFoldableBehavior: false,
      hasTriFoldBehavior: false,
      breakpoints: DEFAULT_BREAKPOINTS,
    })
    expect(type).toBe(DeviceType.TABLET)
  })
})
