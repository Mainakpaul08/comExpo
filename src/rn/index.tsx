import React, {useEffect, useState} from 'react';

export type RNStyle = Omit<React.CSSProperties, 'fontVariant'> & {
  paddingHorizontal?: number | string;
  paddingVertical?: number | string;
  marginHorizontal?: number | string;
  marginVertical?: number | string;
  shadowColor?: string;
  shadowOffset?: {width: number; height: number};
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
  fontVariant?: Array<'tabular-nums' | string> | string;
};

export type StyleProp = RNStyle | false | null | undefined | StyleProp[];

function flattenStyle(style?: StyleProp): React.CSSProperties {
  if (!style) return {};
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flattenStyle));
  }
  const {
    paddingHorizontal,
    paddingVertical,
    marginHorizontal,
    marginVertical,
    shadowColor,
    shadowOffset,
    shadowOpacity,
    shadowRadius,
    elevation,
    fontVariant,
    ...rest
  } = style;

  const out: React.CSSProperties = {...rest};

  if (paddingHorizontal !== undefined) {
    out.paddingLeft = paddingHorizontal;
    out.paddingRight = paddingHorizontal;
  }
  if (paddingVertical !== undefined) {
    out.paddingTop = paddingVertical;
    out.paddingBottom = paddingVertical;
  }
  if (marginHorizontal !== undefined) {
    out.marginLeft = marginHorizontal;
    out.marginRight = marginHorizontal;
  }
  if (marginVertical !== undefined) {
    out.marginTop = marginVertical;
    out.marginBottom = marginVertical;
  }
  if (fontVariant?.includes('tabular-nums')) {
    out.fontVariantNumeric = 'tabular-nums';
  }
  if (shadowRadius !== undefined || elevation !== undefined) {
    const y = shadowOffset?.height ?? 2;
    const blur = shadowRadius ?? (elevation ? elevation * 2 : 8);
    const opacity = shadowOpacity ?? 0.06;
    out.boxShadow = `0 ${y}px ${blur}px rgba(15, 23, 42, ${opacity})`;
  }
  return out;
}

export const StyleSheet = {
  create<T extends Record<string, RNStyle>>(styles: T): T {
    return styles;
  },
  flatten: flattenStyle,
};

export const Platform = {
  OS: 'web' as const,
  select<T>(options: {web?: T; ios?: T; android?: T; default?: T}): T | undefined {
    return options.web ?? options.default;
  },
};

export interface ViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: StyleProp;
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only';
  children?: React.ReactNode;
}

export const View: React.FC<ViewProps> = ({
  style,
  pointerEvents,
  children,
  className,
  ...props
}) => {
  const merged = flattenStyle(style);
  return (
    <div
      {...props}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxSizing: 'border-box',
        minWidth: 0,
        ...(pointerEvents === 'none' || pointerEvents === 'auto'
          ? {pointerEvents}
          : {}),
        ...merged,
      }}
    >
      {children}
    </div>
  );
};

export const SafeAreaView: React.FC<ViewProps> = ({style, children, ...props}) => (
  <View
    {...props}
    style={[
      {
        flex: 1,
        minHeight: 0,
      },
      style,
    ]}
  >
    {children}
  </View>
);

export interface TextProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'style'> {
  style?: StyleProp;
  numberOfLines?: number;
  children?: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({style, numberOfLines, children, ...props}) => {
  const merged = flattenStyle(style);
  const clampStyle: React.CSSProperties =
    numberOfLines === 1
      ? {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }
      : numberOfLines && numberOfLines > 1
        ? {
            display: '-webkit-box',
            WebkitLineClamp: numberOfLines,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }
        : {};

  return (
    <span
      {...props}
      style={{
        fontFamily: 'var(--font-body)',
        ...merged,
        ...clampStyle,
      }}
    >
      {children}
    </span>
  );
};

export interface ScrollViewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: StyleProp;
  contentContainerStyle?: StyleProp;
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  showsVerticalScrollIndicator?: boolean;
  children?: React.ReactNode;
}

export const ScrollView: React.FC<ScrollViewProps> = ({
  style,
  contentContainerStyle,
  horizontal = false,
  children,
  ...props
}) => {
  const outer = flattenStyle(style);
  const inner = flattenStyle(contentContainerStyle);
  return (
    <div
      {...props}
      style={{
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        overflowX: horizontal ? 'auto' : 'hidden',
        overflowY: horizontal ? 'hidden' : 'auto',
        WebkitOverflowScrolling: 'touch',
        minHeight: 0,
        minWidth: 0,
        ...outer,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: horizontal ? 'row' : 'column',
          flexShrink: 0,
          width: horizontal ? 'max-content' : '100%',
          ...inner,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export interface PressableProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style' | 'children'> {
  onPress?: () => void;
  style?: StyleProp | ((state: {pressed: boolean; hovered: boolean}) => StyleProp);
  children?: React.ReactNode | ((state: {pressed: boolean; hovered: boolean}) => React.ReactNode);
  accessibilityLabel?: string;
}

export const Pressable: React.FC<PressableProps> = ({
  onPress,
  onClick,
  style,
  children,
  disabled,
  accessibilityLabel,
  type = 'button',
  ...props
}) => {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const resolvedStyle =
    typeof style === 'function' ? flattenStyle(style({pressed, hovered})) : flattenStyle(style);
  const resolvedChildren =
    typeof children === 'function' ? children({pressed, hovered}) : children;

  return (
    <button
      {...props}
      type={type}
      disabled={disabled}
      aria-label={accessibilityLabel}
      onClick={(e) => {
        if (disabled) return;
        onClick?.(e);
        onPress?.();
      }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => {
        setPressed(false);
        setHovered(false);
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onTouchStart={() => !disabled && setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        textAlign: 'left',
        border: 'none',
        background: 'transparent',
        padding: 0,
        margin: 0,
        font: 'inherit',
        color: 'inherit',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : pressed ? 0.84 : 1,
        transform: pressed ? 'scale(0.985)' : 'scale(1)',
        transition: 'transform 140ms cubic-bezier(0.16, 1, 0.3, 1), opacity 140ms ease, background-color 140ms ease, border-color 140ms ease',
        boxSizing: 'border-box',
        outlineColor: '#4F46E5',
        ...resolvedStyle,
      }}
    >
      {resolvedChildren}
    </button>
  );
};

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style' | 'onChange'> {
  style?: StyleProp;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholderTextColor?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
  style,
  value,
  onChangeText,
  placeholderTextColor,
  multiline,
  numberOfLines = 4,
  ...props
}) => {
  const merged = flattenStyle(style);
  if (multiline) {
    return (
      <textarea
        value={value}
        rows={numberOfLines}
        placeholder={props.placeholder}
        onChange={(e) => onChangeText?.(e.target.value)}
        aria-label={props['aria-label'] ?? props.placeholder}
        style={{
          fontFamily: 'var(--font-body)',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          resize: 'vertical',
          width: '100%',
          boxSizing: 'border-box',
          color: '#0F172A',
          ...merged,
        }}
      />
    );
  }
  return (
    <input
      {...props}
      value={value}
      onChange={(e) => onChangeText?.(e.target.value)}
      aria-label={props['aria-label'] ?? props.placeholder}
      style={{
        fontFamily: 'var(--font-body)',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        width: '100%',
        boxSizing: 'border-box',
        color: '#0F172A',
        ...merged,
        ['--placeholder-color' as string]: placeholderTextColor,
      }}
    />
  );
};

export interface ImageProps {
  source: {uri: string} | string;
  alt: string;
  style?: StyleProp;
  resizeMode?: 'cover' | 'contain';
}

export const Image: React.FC<ImageProps> = ({source, alt, style, resizeMode = 'cover'}) => {
  const [failed, setFailed] = useState(false);
  const uri = typeof source === 'string' ? source : source.uri;
  const merged = flattenStyle(style);

  if (failed) {
    return (
      <div
        aria-label={alt}
        style={{
          backgroundColor: '#E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#475569',
          fontSize: 12,
          fontWeight: 600,
          ...merged,
        }}
      >
        {alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={uri}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      style={{
        objectFit: resizeMode,
        display: 'block',
        ...merged,
      }}
    />
  );
};

export interface ModalProps {
  visible: boolean;
  onRequestClose?: () => void;
  animationType?: 'slide' | 'fade' | 'none';
  transparent?: boolean;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onRequestClose,
  children,
}) => {
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onRequestClose?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [visible, onRequestClose]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onRequestClose?.();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.48)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      className="sm:items-center sm:p-4"
    >
      {children}
    </div>
  );
};

export const ActivityIndicator: React.FC<{color?: string; size?: 'small' | 'large'}> = ({
  color = '#4F46E5',
  size = 'small',
}) => {
  const px = size === 'large' ? 28 : 18;
  return (
    <div
      style={{
        width: px,
        height: px,
        borderRadius: 9999,
        border: `2px solid rgba(79, 70, 229, 0.18)`,
        borderTopColor: color,
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
};

export interface SwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  accessibilityLabel?: string;
}

export const Switch: React.FC<SwitchProps> = ({value, onValueChange, accessibilityLabel}) => (
  <button
    type="button"
    role="switch"
    aria-checked={value}
    aria-label={accessibilityLabel}
    onClick={() => onValueChange(!value)}
    style={{
      width: 46,
      height: 28,
      borderRadius: 999,
      padding: 3,
      border: 'none',
      cursor: 'pointer',
      backgroundColor: value ? '#4F46E5' : '#CBD5E1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: value ? 'flex-end' : 'flex-start',
      transition: 'background-color 160ms ease',
      flexShrink: 0,
    }}
  >
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 999,
        backgroundColor: '#FFFFFF',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.2)',
      }}
    />
  </button>
);
