import { View } from 'react-native';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';

interface HermandadLogoProps {
  size?: number;
  variant?: 'mark' | 'full' | 'horizontal';
  showSubtitle?: boolean;
  className?: string;
}

/**
 * Logotipo oficial de "La Hermandad" - Punto de Venta (POS).
 * Diseño vectorial profesional: Monograma 'H' geométrico estilizado con arco de hermandad y corona artesanal.
 */
export function HermandadLogo({
  size = 48,
  variant = 'mark',
  showSubtitle = true,
  className,
}: HermandadLogoProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Tokens de color semánticos coherentes con el tema existente
  const primaryColor = isDark ? '#6366F1' : '#2A43D4';
  const accentColor = isDark ? '#A5B4FC' : '#4F46E5';
  const bgBadgeColor = isDark ? '#18181B' : '#F4F4F5';
  const borderColor = isDark ? '#27272A' : '#E4E4E7';

  const markSvg = (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Defs>
        <LinearGradient id="hermandadGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor={accentColor} />
          <Stop offset="100%" stopColor={primaryColor} />
        </LinearGradient>
      </Defs>

      {/* Contenedor tipo insignia redondeada */}
      <Rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill={bgBadgeColor}
        stroke={borderColor}
        strokeWidth="1.5"
      />

      {/* Monograma geométrico H con arco artesanal */}
      {/* Columna izquierda de la H */}
      <Rect x="13" y="13" width="5.5" height="22" rx="2.5" fill="url(#hermandadGrad)" />

      {/* Columna derecha de la H */}
      <Rect x="29.5" y="13" width="5.5" height="22" rx="2.5" fill="url(#hermandadGrad)" />

      {/* Barra transversal con curvatura de alianza/hermandad */}
      <Path
        d="M17 22.5C21 21 27 21 31 22.5V26.5C27 25 21 25 17 26.5V22.5Z"
        fill="url(#hermandadGrad)"
      />

      {/* Punto superior central de coronación */}
      <Circle cx="24" cy="14" r="2.2" fill={accentColor} />
    </Svg>
  );

  if (variant === 'mark') {
    return <View className={className}>{markSvg}</View>;
  }

  if (variant === 'horizontal') {
    return (
      <View className={`flex-row items-center gap-3 ${className || ''}`}>
        {markSvg}
        <View className="justify-center">
          <Text className="text-lg font-bold tracking-tight text-foreground leading-5">
            LA HERMANDAD
          </Text>
          {showSubtitle && (
            <Text className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              Punto de Venta
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Full / Vertical layout
  return (
    <View className={`items-center gap-2 ${className || ''}`}>
      {markSvg}
      <View className="items-center">
        <Text className="text-xl font-bold tracking-tight text-foreground">
          LA HERMANDAD
        </Text>
        {showSubtitle && (
          <Text className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Punto de Venta
          </Text>
        )}
      </View>
    </View>
  );
}
