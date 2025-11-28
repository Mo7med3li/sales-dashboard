import { Chart } from "react-charts";
import supabase from "../supabase-client";
import { useEffect, useState } from "react";
import Form from "../components/FormDeals";

interface Metric {
  name: string;
  sum: number;
}

function Dashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const fetchData = async () => {
    try {
      const { error, data } = await supabase.from("sales_deals").select(
        `
    name,
    value.sum()
    `
      );
      if (error) {
        throw error;
      }
      setMetrics(data);
      console.log(data);
    } catch (error) {
      console.error("there is an error", error);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("deal-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sales_deals",
        },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const chartData = [
    {
      data: metrics.map((m) => ({
        primary: m.name,
        secondary: m.sum,
      })),
    },
  ];

  const primaryAxis = {
    getValue: (d: { primary: string; secondary: number }) => d.primary,
    scaleType: "band" as const,
    padding: 0.2,
    position: "bottom" as const,
  };

  const secondaryAxes = [
    {
      getValue: (d: { primary: string; secondary: number }) => d.secondary,
      scaleType: "linear" as const,
      min: 0,
      max: y_max(),
      padding: {
        top: 20,
        bottom: 40,
      },
    },
  ];

  function y_max() {
    if (metrics.length > 0) {
      const maxSum = Math.max(...metrics.map((m) => m.sum));
      return maxSum + 2000;
    }
    return 5000;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="chart-container">
        <h2>Total Sales This Quarter ($)</h2>
        <div style={{ flex: 1 }}>
          <Chart
            options={{
              data: chartData,
              primaryAxis,
              secondaryAxes,
              defaultColors: ["#58d675"],
              tooltip: {
                show: false,
              },
            }}
          />
        </div>
      </div>
      <Form metrics={metrics} />
    </div>
  );
}

export default Dashboard;
