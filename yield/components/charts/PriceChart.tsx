import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Text } from '@/components/ui/text';
import * as shape from 'd3-shape';
import * as scale from 'd3-scale';

interface ChartDataPoint {
    date: number;
    value: number;
}

interface PriceChartProps {
    data: ChartDataPoint[];
    height?: number;
    width?: number;
    color?: string;
    loading?: boolean;
}

export function PriceChart({
    data,
    height = 200,
    width = Dimensions.get('window').width - 48, // Default padded width
    color = '#FA4616', // Primary Orange
    loading = false
}: PriceChartProps) {

    if (loading || !data || data.length === 0) {
        return (
            <View className="items-center justify-center p-4 bg-muted/20 rounded-xl" style={{ height }}>
                <Text className="text-muted-foreground">
                    {loading ? 'Loading chart...' : 'No historical data available'}
                </Text>
            </View>
        );
    }

    // Process Data
    const { path, area } = useMemo(() => {
        // Sort by date just in case
        const sortedData = [...data].sort((a, b) => a.date - b.date);

        const xDomain = [sortedData[0].date, sortedData[sortedData.length - 1].date];
        const yDomain = [
            Math.min(...sortedData.map(d => d.value)) * 0.95, // Add some padding
            Math.max(...sortedData.map(d => d.value)) * 1.05
        ];

        const xScale = scale.scaleTime()
            .domain(xDomain)
            .range([0, width]);

        const yScale = scale.scaleLinear()
            .domain(yDomain)
            .range([height, 0]);

        const lineGenerator = shape.line()
            .x((d: ChartDataPoint) => xScale(d.date))
            .y((d: ChartDataPoint) => yScale(d.value))
            .curve(shape.curveMonotoneX);

        const areaGenerator = shape.area()
            .x((d: ChartDataPoint) => xScale(d.date))
            .y0(height)
            .y1((d: ChartDataPoint) => yScale(d.value))
            .curve(shape.curveMonotoneX);

        return {
            path: lineGenerator(sortedData) || '',
            area: areaGenerator(sortedData) || ''
        };
    }, [data, width, height]);

    return (
        <View>
            <Svg height={height} width={width}>
                <Defs>
                    <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor={color} stopOpacity="0.2" />
                        <Stop offset="1" stopColor={color} stopOpacity="0" />
                    </LinearGradient>
                </Defs>

                {/* Area Fill */}
                <Path d={area} fill="url(#gradient)" />

                {/* Line Stroke */}
                <Path d={path} stroke={color} strokeWidth={2} fill="none" />
            </Svg>
        </View>
    );
}
