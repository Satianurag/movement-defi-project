import React, { useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import { Svg, Path, G, Text as SvgText } from 'react-native-svg';
import * as shape from 'd3-shape';
import { Text } from '@/components/ui/text';

interface DataItem {
    name: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    data: DataItem[];
    height?: number;
    width?: number;
    radius?: number;
    innerRadius?: number;
}

export function DonutChart({
    data,
    height = 200,
    width: propWidth,
    radius = 80,
    innerRadius = 60
}: DonutChartProps) {
    const screenWidth = Dimensions.get('window').width;
    const width = propWidth || screenWidth;
    const centerX = width / 2;
    const centerY = height / 2;

    const arcs = useMemo(() => {
        const pieGenerator = shape.pie()
            .value((d: any) => d.value)
            .sort(null);

        const arcGenerator = shape.arc()
            .outerRadius(radius)
            .innerRadius(innerRadius)
            .padAngle(0.05)
            .cornerRadius(4);

        const arcs = pieGenerator(data);

        return arcs.map((arc: any, index: number) => ({
            path: arcGenerator(arc) || '',
            color: data[index].color,
            data: data[index],
            centroid: arcGenerator.centroid(arc),
        }));
    }, [data, radius, innerRadius]);

    const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

    return (
        <View className="items-center justify-center">
            <Svg width={width} height={height}>
                <G x={centerX} y={centerY}>
                    {arcs.map((arc: any, i: number) => (
                        <Path
                            key={i}
                            d={arc.path}
                            fill={arc.color}
                        />
                    ))}

                    {/* Center Text */}
                    <SvgText
                        x="0"
                        y="-10"
                        fill="#FFFFFF"
                        textAnchor="middle"
                        fontSize="24"
                        fontWeight="bold"
                    >
                        ${(totalValue / 1000).toFixed(1)}k
                    </SvgText>
                    <SvgText
                        x="0"
                        y="15"
                        fill="#A1A1AA"
                        textAnchor="middle"
                        fontSize="12"
                    >
                        Total Value
                    </SvgText>
                </G>
            </Svg>

            {/* Legend */}
            <View className="flex-row flex-wrap justify-center mt-4 gap-4 px-4">
                {data.map((item, i) => (
                    <View key={i} className="flex-row items-center gap-2">
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                        <Text className="text-sm text-muted-foreground">
                            {item.name} ({Math.round((item.value / totalValue) * 100)}%)
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
