import React, { useMemo } from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { Svg, Path, Defs, LinearGradient, Stop, Line, Circle } from 'react-native-svg';
import * as d3 from 'd3-shape';
import * as scale from 'd3-scale';
import { Text } from '@/components/ui/text';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
// @ts-ignore
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { formatCurrency } from '@/lib/utils'; // Assuming this helper exists or I'll fix it

interface PricePoint {
    timestamp: number;
    value: number;
}

interface PriceChartProps {
    data: PricePoint[];
    color?: string;
    height?: number;
    width?: number;
    onScrub?: (value: number | null) => void;
    loading?: boolean;
}

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedView = Animated.createAnimatedComponent(View);

export function PriceChart({
    data,
    color = '#FA4616',
    height = 250,
    width: propWidth,
    onScrub,
    loading = false
}: PriceChartProps) {
    const screenWidth = Dimensions.get('window').width;
    const width = propWidth || screenWidth - 32; // Default to screen width minus padding
    const padding = 0;

    // Scales
    const { x, y } = useMemo(() => {
        if (!data || data.length === 0) return { x: () => 0, y: () => 0 };

        const x = scale.scaleTime()
            .domain([Math.min(...data.map(d => d.timestamp)), Math.max(...data.map(d => d.timestamp))])
            .range([0, width]);

        const minVal = Math.min(...data.map(d => d.value));
        const maxVal = Math.max(...data.map(d => d.value));
        const yPadding = (maxVal - minVal) * 0.1;

        const y = scale.scaleLinear()
            .domain([minVal - yPadding, maxVal + yPadding])
            .range([height, 0]);

        return { x, y };
    }, [data, width, height]);

    // Paths
    const { linePath, areaPath } = useMemo(() => {
        if (!data || data.length === 0) return { linePath: '', areaPath: '' };
        // @ts-ignore - d3 types can be tricky
        const lineFn = d3.line<PricePoint>()
            // @ts-ignore
            .x(d => x(d.timestamp))
            // @ts-ignore
            .y(d => y(d.value))
            .curve(d3.curveMonotoneX);

        // @ts-ignore
        const areaFn = d3.area<PricePoint>()
            // @ts-ignore
            .x(d => x(d.timestamp))
            .y0(height)
            // @ts-ignore
            .y1(d => y(d.value))
            .curve(d3.curveMonotoneX);

        return {
            linePath: lineFn(data) || '',
            areaPath: areaFn(data) || '',
        };
    }, [data, x, y, height]);

    // Interaction State
    const activeX = useSharedValue(0);
    const activeY = useSharedValue(0);
    const isActive = useSharedValue(false);

    const pan = Gesture.Pan()
        .onBegin(() => {
            isActive.value = true;
        })
        .onUpdate((event: any) => {
            const xPos = Math.max(0, Math.min(width, event.x));
            activeX.value = xPos;

            // Find closest data point
            // @ts-ignore
            const date = x.invert(xPos);
            // @ts-ignore
            const index = d3.bisector((d: PricePoint) => d.timestamp).left(data, date, 1);
            const d0 = data[index - 1];
            const d1 = data[index];

            let d = d0;
            if (d1 && d0) {
                d = (date.getTime() - d0.timestamp) > (d1.timestamp - date.getTime()) ? d1 : d0;
            }

            if (d) {
                // @ts-ignore
                activeY.value = y(d.value);
                if (onScrub) {
                    runOnJS(onScrub)(d.value);
                }
            }
        })
        .onEnd(() => {
            isActive.value = false;
            if (onScrub) {
                runOnJS(onScrub)(null);
            }
        });

    const cursorStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isActive.value ? 1 : 0),
        transform: [{ translateX: activeX.value }]
    }));

    const indicatorStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isActive.value ? 1 : 0),
        transform: [
            { translateX: activeX.value },
            { translateY: activeY.value }
        ]
    }));

    if (loading) {
        return (
            <View style={{ height, width }} className="items-center justify-center bg-muted/10 rounded-xl">
                <Text className="text-muted-foreground">Loading...</Text>
            </View>
        );
    }

    if (!data || data.length === 0) {
        return (
            <View style={{ height, width }} className="items-center justify-center bg-muted/10 rounded-xl">
                <Text className="text-muted-foreground">No data available</Text>
            </View>
        );
    }

    return (
        <View>
            <GestureDetector gesture={pan}>
                <View style={{ width, height }}>
                    <Svg width={width} height={height}>
                        <Defs>
                            <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0" stopColor={color} stopOpacity="0.3" />
                                <Stop offset="1" stopColor={color} stopOpacity="0" />
                            </LinearGradient>
                        </Defs>

                        <Path
                            d={areaPath}
                            fill="url(#gradient)"
                            stroke="none"
                        />

                        <Path
                            d={linePath}
                            fill="none"
                            stroke={color}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </Svg>

                    {/* Interaction Overlay */}
                    <AnimatedView
                        style={[
                            StyleSheet.absoluteFill,
                            cursorStyle,
                            { width: 1.5, backgroundColor: 'white', opacity: 0.5 }
                        ]}
                        pointerEvents="none"
                    />

                    <AnimatedView
                        style={[
                            { position: 'absolute', top: -6, left: -6, width: 12, height: 12, borderRadius: 6, backgroundColor: color, borderWidth: 2, borderColor: '#fff' },
                            indicatorStyle
                        ]}
                        pointerEvents="none"
                    />
                </View>
            </GestureDetector>
        </View>
    );
}
