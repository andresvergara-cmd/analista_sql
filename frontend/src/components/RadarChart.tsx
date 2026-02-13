
import React from 'react';

interface RadarChartProps {
    data: { label: string; value: number; color?: string; }[];
    maxValue?: number;
    size?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, maxValue = 5, size = 300 }) => {
    const radius = size / 2;
    const center = size / 2;
    const angleStep = (Math.PI * 2) / data.length;
    // Rotate -90 degrees to start at top
    const startAngle = -Math.PI / 2;

    // Helper to get coordinates
    const getCoordinates = (value: number, index: number) => {
        const angle = startAngle + index * angleStep;
        const distance = (value / maxValue) * (radius * 0.8); // 80% of radius for max value
        return {
            x: center + distance * Math.cos(angle),
            y: center + distance * Math.sin(angle)
        };
    };

    // Data polygon points
    const points = data.map((d, i) => {
        const { x, y } = getCoordinates(d.value, i);
        return `${x},${y}`;
    }).join(' ');

    // Grid polygons
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {/* Grid Circles/Polygons */}
            {gridLevels.map((level, i) => {
                const levelPoints = data.map((_, index) => {
                    const { x, y } = getCoordinates(maxValue * level, index);
                    return `${x},${y}`;
                }).join(' ');
                return (
                    <polygon
                        key={i}
                        points={levelPoints}
                        fill="transparent"
                        stroke="currentColor"
                        strokeOpacity={0.1}
                        className="text-slate-400 dark:text-slate-600"
                    />
                );
            })}

            {/* Axes */}
            {data.map((_, i) => {
                const { x, y } = getCoordinates(maxValue, i);
                return (
                    <line
                        key={i}
                        x1={center}
                        y1={center}
                        x2={x}
                        y2={y}
                        stroke="currentColor"
                        strokeOpacity={0.1}
                        className="text-slate-400 dark:text-slate-600"
                    />
                );
            })}

            {/* Data Polygon */}
            <polygon
                points={points}
                fill="currentColor"
                fillOpacity={0.2}
                stroke="currentColor"
                strokeWidth={2}
                className="text-primary transition-all duration-1000 ease-out"
            />

            {/* Data Points */}
            {data.map((d, i) => {
                const { x, y } = getCoordinates(d.value, i);
                return (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={4}
                        className="text-primary fill-current transition-all duration-1000 ease-out"
                    />
                );
            })}

            {/* Labels */}
            {data.map((d, i) => {
                const angle = startAngle + i * angleStep; // Corrected index variable from 'index' to 'i'
                const labelRadius = radius * 1.15; // Push labels out further
                const x = center + labelRadius * Math.cos(angle);
                const y = center + labelRadius * Math.sin(angle);

                // Adjust text anchor based on position
                const anchor = Math.abs(x - center) < 10 ? 'middle' : x > center ? 'start' : 'end';
                const baseline = Math.abs(y - center) < 10 ? 'middle' : y > center ? 'hanging' : 'auto'; // 'baseline' is default

                return (
                    <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor={anchor}
                        dominantBaseline={baseline}
                        className="text-[10px] font-bold fill-slate-500 dark:fill-slate-400 uppercase tracking-tighter"
                    >
                        {d.label}
                    </text>
                );
            })}
        </svg>
    );
};
