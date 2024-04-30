interface GlobalContextType {
  getPaintStyles: () => PaintStyle[] | null
  setPaintStyles: (styles: PaintStyle[]) => void
}

let paintStyles: PaintStyle[] | null = null

const setPaintStyles = (styles: PaintStyle[]) => {
  paintStyles = styles
}

const getPaintStyles = (): PaintStyle[] | null => {
  return paintStyles
}

export const GlobalContext: GlobalContextType = {
  getPaintStyles,
  setPaintStyles,
}
