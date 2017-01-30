const devices = [
  { name: 'Galaxy S5', w: '360px', h: '640px' },
  { name: 'Nexus 5X/6P', w: '412px', h: '732px' },
  { name: 'iPhone 4', w: '320px', h: '480px' },
  { name: 'iPhone 5', w: '320px', h: '568px' },
  { name: 'iPhone 6/7', w: '375px', h: '667px' },
  { name: 'iPhone 6/7 Plus', w: '414px', h: '736px' },
  { name: 'iPad', w: '768px', h: '1024px' }
].reduce((devices, device) => {
  const landscapeDevice = {
    ...device,
    name: device.name + ' (LS)',
    w: device.h,
    h: device.w
  }
  return [
    ...devices,
    device,
    landscapeDevice
  ]
}, [])

export default devices
