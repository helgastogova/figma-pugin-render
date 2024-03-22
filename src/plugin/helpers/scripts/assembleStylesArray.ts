export function assembleStylesArray(styles) {
  const reformatedArray = []

  styles.forEach((style) => {
    let hidden: boolean = false

    const item = {
      name: style.name,
      key: style.key,
      id: style.id,
      theme: '',
      type: style.type,
      paints: style.paints ?? [],
    }

    if (item.name.includes('_') || item.name.includes('.')) {
      const splitName = item.name.split('/')
      splitName.forEach((chunk) => {
        if (chunk[0] === '_' || chunk[0] === '.') {
          hidden = true
        }
      })
    }

    if (hidden === false) {
      reformatedArray.push(item)
    }
  })

  const keys = reformatedArray.map((o) => o.key)
  const filteredArray = reformatedArray.filter(({ key }, index) => !keys.includes(key, index + 1))
  return filteredArray
}
