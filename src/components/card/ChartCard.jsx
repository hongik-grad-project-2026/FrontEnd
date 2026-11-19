

import { BarChart, Bar, XAxis, YAxis, Cell, LabelList } from "recharts";
import styles from "./ChartCard.module.css";


// 막대 뒤 회색 배경 (maxValue 까지 깔림)
const TRACK = {
    fill: "var(--color-neutral-10)",
    strokeWidth: 0,
    radius: 8
};

const LABEL_WIDTH = 200; // 
const ROW_HEIGHT = 48;   // 한 줄 높이(px)
const BAR_SIZE = 36;     // 막대 두께(px)

function getUtilizationRate({ totalCount, rentedCount }) {
    if (
        !Number.isSafeInteger(totalCount) ||
        !Number.isSafeInteger(rentedCount) ||
        totalCount < 0 ||
        rentedCount < 0 ||
        rentedCount > totalCount
    ) {
        throw new Error("모델별 전체 수량과 대여 중 수량을 확인해 주세요.");
    }

    return totalCount === 0 ? 0 : (rentedCount / totalCount) * 100;
}




export default function ChartCard({
    title,
    unit = "",
    maxValue,
    items = [],
    rankColors = [
        { fill: "var(--color-brand-secondary)", stroke: "var(--color-brand-primary)" },
        { fill: "var(--color-status-success-light)", stroke: "var(--color-status-success-dark)" },
        { fill: "var(--color-status-warning-light)", stroke: "var(--color-status-warning)" },
    ],
}) {

    const data = items.map((item, index) => {
        const detail = item.detail?.replace(
            /(\d+)\s*개\s*\/\s*(\d+)\s*개/,
            "$1/$2개"
        );
        const isUtilizationChart = unit === "%";
        const value = isUtilizationChart
            ? getUtilizationRate(item)
            : item.value;

        return {
            ...item,
            display: `${item.rank ?? index + 1}. ${item.label.trim()}`,
            value,
            barLabel: isUtilizationChart
                ? `${Math.round(value)}% (${item.rentedCount}/${item.totalCount}개)`
                : `${value}${unit}${detail ? ` (${detail})` : ""}`,
        };
    });

    // 왼쪽 라벨이 축 너비를 넘으면 말줄임표로 표시
    const renderNameTick = ({ x, y, payload }) => (
        <foreignObject
            x={x - LABEL_WIDTH + 8}
            y={y - 12}
            width={LABEL_WIDTH - 16}
            height={24}
        >
            <div
                xmlns="http://www.w3.org/1999/xhtml"
                className={styles.axisLabel}
                title={payload.value}
            >
                <span className={styles.axisLabelText}>{payload.value}</span>
            </div>
        </foreignObject>
    );

    const renderBarLabel = ({ x, viewBox, value }) => (
        <text
            className={styles.barLabel}
            x={x + 12}
            y={viewBox.y + viewBox.height / 2}
            fill="#1f2937"
            textAnchor="start"
            dominantBaseline="middle"
        >
            {value}
        </text>
    );

    return (
        <div className={styles.card}>
            <h4 className={styles.title}>{title}</h4>

            {data.length === 0 ? (
                <p className={styles.empty}>표시할 데이터가 없습니다.</p>
            ) : (
                <BarChart
                    layout="vertical"
                    data={data}
                    responsive
                    style={{ width: "100%", height: data.length * ROW_HEIGHT }}
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                    {/* 값 축. 노트북·태블릿은 0~100%, 장기 미대여는 가장 큰 값까지 */}
                    <XAxis type="number" domain={[0, maxValue ?? "dataMax"]} hide />

                    <YAxis
                        type="category"
                        dataKey="display"
                        width={LABEL_WIDTH}
                        tick={renderNameTick}
                    />

                    <Bar
                        dataKey="value"
                        barSize={BAR_SIZE}
                        radius={[0, 8, 8, 0]}
                        background={TRACK}>
                        {data.map((item, index) => {
                            const color = rankColors[index % rankColors.length];
                            return (
                                <Cell
                                    key={item.modelId ?? item.itemId ?? item.label}
                                    fill={color.fill}
                                    stroke={color.stroke}
                                    strokeWidth={1}
                                />
                            );
                        })}
                        {/* 가동률과 상세 수량을 막대 안에 표시 */}
                        <LabelList
                            dataKey="barLabel"
                            position="insideLeft"
                            offset={16}
                            content={renderBarLabel}
                        />
                    </Bar>
                </BarChart>
            )
            }
        </div >
    );
}
