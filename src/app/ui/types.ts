import type React from 'react'

export interface PseudoStates {
  active?: boolean
  disabled?: boolean
  focused?: boolean
  hovered?: boolean
  invalid?: boolean
}

// Polymorphic refs

// Source: https://github.com/emotion-js/emotion/blob/master/packages/styled-base/types/helper.d.ts
// A more precise version of just React.ComponentPropsWithoutRef on its own
export type PropsOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>,
> = JSX.LibraryManagedAttributes<T, React.ComponentPropsWithoutRef<T>>

interface AsProp<T extends React.ElementType> {
  /**
   * An override of the default HTML tag.
   * Can also be another React component.
   */
  as?: T
}

/**
 * Allows for extending a set of props (`ExtendedProps`) by an overriding set of props
 * (`OverrideProps`), ensuring that any duplicates are overridden by the overriding
 * set of props.
 */
export type ExtendableProps<
  ExtendedProps = {}, // eslint-disable-line @typescript-eslint/ban-types
  OverrideProps = {}, // eslint-disable-line @typescript-eslint/ban-types
> = OverrideProps & Omit<ExtendedProps, keyof OverrideProps>

/**
 * Allows for inheriting the props from the specified element type so that
 * props like children, className & style work, as well as element-specific
 * attributes like aria roles. The component (`C`) must be passed in.
 */
export type InheritableElementProps<
  T extends React.ElementType,
  Props = {}, // eslint-disable-line @typescript-eslint/ban-types
> = ExtendableProps<PropsOf<T>, Props>

/**
 * A more sophisticated version of `InheritableElementProps` where
 * the passed in `as` prop will determine which props can be included
 */
export type PolymorphicComponentProps<
  T extends React.ElementType,
  Props = {}, // eslint-disable-line @typescript-eslint/ban-types
> = InheritableElementProps<T, Props & AsProp<T>>

/**
 * Utility type to extract the `ref` prop from a polymorphic component
 */
export type PolymorphicRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>['ref']
/**
 * A wrapper of `PolymorphicComponentProps` that also includes the `ref`
 * prop for the polymorphic component
 */
export type PolymorphicComponentPropsWithRef<
  T extends React.ElementType,
  Props = {}, // eslint-disable-line @typescript-eslint/ban-types
> = PolymorphicComponentProps<T, Props> & { ref?: PolymorphicRef<T> }

// Utility types

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

export type Maybe<T> = T | null

export type DeepNonNullable<T> = NonNullable<{
  [P in keyof T]-?: NonNullable<T[P]>
}>
