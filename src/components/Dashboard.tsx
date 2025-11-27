import { useEffect } from "react";
import supabase from "../supabase-client";

function Dashboard() {
  const fetchData = async () => {
    const response = await supabase
      .from("sales_deals")
      .select(
        `
    name,
    value
    `
      )
      .order("value", { ascending: false })
      .limit(1);
    console.log(response);
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="dashboard-wrapper">
      <div className="chart-container">
        <h2>Total Sales This Quarter ($)</h2>
      </div>
    </div>
  );
}

export default Dashboard;
