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
  const chartHeight = 160;

  const logMin = Math.log(minY || 1);
  const logMax = Math.log(maxY || 1);
  const logRange = logMax - logMin || 1;

  return (
    <View style={styles.container}>
      <View style={styles.chart}>
        {data.map((point, i) => {
          const logValue = Math.log(point.value || 1);
          const heightPercent = ((logValue - logMin) / logRange) * 100;
          const isLast = i === data.length - 1;
          
          return (
            <View key={i} style={styles.barContainer}>
              <Text style={[styles.valueLabel, { color }]}>
                {`${point.value}`}
              </Text>
              <View style={[styles.barWrapper, { height: chartHeight }]}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPercent, 10)}%`,
                      backgroundColor: isLast ? `${color}80` : `${color}60`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.xLabel}>
                {point.label}
              </Text>
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
    alignItems: "flex-start",
    gap: 6,
    paddingHorizontal: 2,
    paddingTop: 12,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  valueLabel: {
    color: "#888888",
    fontSize: 9,
    marginBottom: 20,
    height: 11,
    fontWeight: "600",
  },
  barWrapper: {
    width: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 40,
  },
  xLabel: {
    color: "#888888",
    fontSize: 8,
    marginTop: 10,
    textAlign: "center",
  },
  baseline: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginTop: 4,
    marginHorizontal: 4,
  },
});