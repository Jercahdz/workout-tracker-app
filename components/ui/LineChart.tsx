import { View, Text, StyleSheet } from "react-native";

interface DataPoint {
  value: number;
  label: string;
}

interface LineChartProps {
  data: DataPoint[];
  color?: string;
  unit?: string;
}

export const LineChart = ({ data, color = "#00FF87", unit = "kg" }: LineChartProps) => {
  if (data.length < 2) return null;

  const values = data.map((d) => d.value);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const rangeY = maxY - minY || 1;
  const chartHeight = 120;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((point, i) => {
          const heightPercent = ((point.value - minY) / rangeY) * 100;
          const isLast = i === data.length - 1;
          return (
            <View key={i} style={styles.barContainer}>
              <Text style={[styles.valueLabel, isLast && { color }]}>
                {isLast ? `${point.value}` : ""}
              </Text>
              <View style={[styles.barWrapper, { height: chartHeight }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPercent, 5)}%`,
                      backgroundColor: isLast ? color : `${color}60`,
                    },
                  ]}
                />
              </View>
              {(i === 0 || isLast || i === Math.floor(data.length / 2)) && (
                <Text style={styles.xLabel}>{point.label}</Text>
              )}
            </View>
          );
        })}
      </View>
      <View style={styles.baseline} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    paddingHorizontal: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  valueLabel: {
    color: "#888888",
    fontSize: 10,
    marginBottom: 2,
    height: 14,
  },
  barWrapper: {
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  xLabel: {
    color: "#888888",
    fontSize: 9,
    marginTop: 4,
    textAlign: "center",
  },
  baseline: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginTop: 2,
    marginHorizontal: 4,
  },
});