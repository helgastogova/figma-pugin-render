import { isPublished } from '../../helpers'

export type StyleData = {
  publishedStatus: string
}

export type ColorStyleData = StyleData & {
  type: 'color'
  styles: PaintStyle[]
}

export type TextStyleData = StyleData & {
  type: 'text'
  styles: TextStyle[]
}

export type EffectStyleData = StyleData & {
  type: 'effect'
  styles: EffectStyle[]
}

export type GridStyleData = StyleData & {
  type: 'grid'
  styles: GridStyle[]
}

async function getStylesByType(type: 'color' | 'text' | 'effect'): Promise<BaseStyle[]> {
  const styleMethods = {
    color: figma.getLocalPaintStyles,
    text: figma.getLocalTextStyles,
    effect: figma.getLocalEffectStyles,
    grid: figma.getLocalGridStyles,
  }
  const styles = styleMethods[type]()

  return styles.length > 0 ? styles : []
}

export async function getLocalStyles(
  type: 'color' | 'text' | 'effect', // | 'grid',
): Promise<ColorStyleData | TextStyleData | EffectStyleData> {
  const styles = await getStylesByType(type)
  const cleanedStyleData = assembleStylesArray(styles)
  const publishedStatus = await isPublished(cleanedStyleData)

  return {
    type,
    styles: cleanedStyleData,
    publishedStatus,
  }
}

export type NormalizedCollection = Pick<VariableCollection, 'id' | 'name' | 'remote' | 'modes' | 'variableIds'>

export type NormalizedCollectionMap = Record<string, NormalizedCollection>

export const getCollections = async (): Promise<NormalizedCollectionMap> => {
  const collections: NormalizedCollectionMap = {}
  const rawCollections = await figma.variables.getLocalVariableCollectionsAsync()

  rawCollections.map((collection) => {
    const { id, name, remote, modes, variableIds, defaultModeId } = collection
    collections[id] = { id, name, remote, modes, variableIds, defaultModeId }
  })

  return collections
}

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
