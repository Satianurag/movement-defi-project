import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import { Svg, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as scale from 'd3-scale';
import { Text } from '@/components/ui/text';

interface VolumePoint {
    timestamp: number;
    value: number;
}

interface VolumeChartProps {
    data: VolumePoint[];
    color?: string;
    height?: number;
    width?: number;
}

export function VolumeChart({
    data,
    color = '#16A34A', // Success Green
    height = 150,
    width: propWidth
}: VolumeChartProps) {
    const screenWidth = Dimensions.get('window').width;
    const width = propWidth || screenWidth - 32;

    const { x, y, barWidth } = useMemo(() => {
        if (!data || data.length === 0) return { x: () => 0, y: () => 0, barWidth: 0 };

        const x = scale.scaleTime()
            .domain([Math.min(...data.map(d => d.timestamp)), Math.max(...data.map(d => d.timestamp))])
            .range([0, width]);

        const y = scale.scaleLinear()
            .domain([0, Math.max(...data.map(d => d.value)) * 1.1])
            .range([height, 0]);

        // Calculate bar width based on data density, max 20px
        const timeSpan = x.range()[1] - x.range()[0];
        const calculatedWidth = (timeSpan / data.length) * 0.7;
        const barWidth = Math.min(Math.max(calculatedWidth, 2), 20);

        return { x, y, barWidth };
    }, [data, width, height]);

    if (!data || data.length === 0) {
        return (
            <View style={{ height, width }} className="items-center justify-center bg-muted/10 rounded-xl">
                <Text className="text-muted-foreground">No volume data</Text>
            </View>
        );
    }

    return (
        <View style={{ width, height }}>
            <Svg width={width} height={height}>
                <Defs>
                    <LinearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.8" />
                        <Stop offset="1" stopColor={color} stopOpacity="0.3" />
                    </LinearGradient>
                </Defs>
                {data.map((d, index) => (
                    <Rect
                        key={index}
                        x={x(d.timestamp) - barWidth / 2}
                        y={y(d.value)}
                        width={barWidth}
                        height={height - y(d.value)}
                        fill="url(#volGradient)"
                        rx={2}
                    />
                ))}
            </Svg>
        </View>
    );
}
