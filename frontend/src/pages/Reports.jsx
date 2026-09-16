import { useEffect, useState } from "react";

import {
  Users,
  CreditCard,
  UserCheck,
  IndianRupee,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";


function Reports() {

  const API_URL = import.meta.env.VITE_API_URL;
  const [reports, setReports] = useState({
  total_customers: 0,
  total_plans: 0,
  active_subscriptions: 0,
  total_revenue: 0,
  popular_plans: [],
  highest_spending_customers: [],
  monthly_revenue: [],
  plan_subscription_count: [],
  payment_method_distribution: [],
  churn_analysis: []
});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* chart style for each report */

const [chartTypes, setChartTypes] = useState({
  revenue: "area",
  churn: "doughnut",
  popular: "horizontalBar",
  spending: "horizontalBar",
  paymentMethods: "bar"
});


  useEffect(() => {
    loadReports();
  }, []);


  const loadReports = async () => {

    try {

      const response = await fetch(
  `${API_URL}/api/reports`
);

      if (!response.ok) {
        throw new Error("Failed to load reports");
      }

      const data = await response.json();

      setReports(data);

    } catch (error) {

      setError(error.message);

    } finally {

      setLoading(false);

    }
  };


  /* change chart type */

  const changeChartType = (report, type) => {

    setChartTypes((previous) => ({
      ...previous,
      [report]: type
    }));

  };


if (loading) {
    return (
        <div className="loading-screen">
            <h2>Loading reports...</h2>
        </div>
    );
}


  if (error) {

    return (
      <div className="page reports-page">

        <div className="error-state">

          <h2>Unable to load reports</h2>

          <p>{error}</p>

        </div>

      </div>
    );

  }


  /* ------------------------------------
     REUSABLE TOOLTIP
     ------------------------------------ */

  const tooltipStyle = {
    background: "#181818",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff"
  };


  /* ------------------------------------
     REVENUE CHART
     ------------------------------------ */

  const renderRevenueChart = () => {

    if (chartTypes.revenue === "line") {

      return (
        <ResponsiveContainer width="100%" height={330}>

          <LineChart data={reports.monthly_revenue}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#292929"
            />

            <XAxis
              dataKey="month_name"
              stroke="#777"
            />

            <YAxis stroke="#777" />

            <Tooltip
              formatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`
              }
              contentStyle={tooltipStyle}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 5 }}
              activeDot={{ r: 7 }}
            />

          </LineChart>

        </ResponsiveContainer>
      );
    }


    if (chartTypes.revenue === "bar") {

      return (
        <ResponsiveContainer width="100%" height={330}>

          <BarChart data={reports.monthly_revenue}>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#292929"
            />

            <XAxis
              dataKey="month_name"
              stroke="#777"
            />

            <YAxis stroke="#777" />

            <Tooltip
              formatter={(value) =>
                `₹${Number(value).toLocaleString("en-IN")}`
              }
              contentStyle={tooltipStyle}
            />

            <Bar
              dataKey="revenue"
              name="Revenue"
              fill="#3B82F6"
              radius={[6, 6, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>
      );
    }


    return (
      <ResponsiveContainer width="100%" height={330}>

        <AreaChart data={reports.monthly_revenue}>

          <defs>

            <linearGradient
              id="revenueGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >

              <stop
                offset="5%"
                stopColor="#3B82F6"
                stopOpacity={0.35}
              />

              <stop
                offset="95%"
                stopColor="#3B82F6"
                stopOpacity={0}
              />

            </linearGradient>

          </defs>


          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#292929"
          />

          <XAxis
            dataKey="month_name"
            stroke="#777"
          />

          <YAxis stroke="#777" />

          <Tooltip
            formatter={(value) =>
              `₹${Number(value).toLocaleString("en-IN")}`
            }
            contentStyle={tooltipStyle}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#revenueGradient)"
          />

        </AreaChart>

      </ResponsiveContainer>
    );
  };


  /* ------------------------------------
     CHURN CHART
     ------------------------------------ */

  const renderChurnChart = () => {

    if (chartTypes.churn === "stacked") {

  const activeCount = reports.churn_analysis.find(
    (item) => item.status === "active"
  )?.subscription_count || 0;

  const cancelledCount = reports.churn_analysis.find(
    (item) => item.status === "cancelled"
  )?.subscription_count || 0;

  const expiredCount = reports.churn_analysis.find(
    (item) => item.status === "expired"
  )?.subscription_count || 0;

  const stackedData = [
    {
      name: "Subscriptions",
      active: Number(activeCount),
      cancelled: Number(cancelledCount),
      expired: Number(expiredCount)
    }
  ];

  return (
    <ResponsiveContainer width="100%" height={330}>

      <BarChart
        data={stackedData}
        layout="vertical"
        margin={{
          left: 20,
          right: 20
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#292929"
        />

        <XAxis
          type="number"
          stroke="#777"
          allowDecimals={false}
        />

        <YAxis
          type="category"
          dataKey="name"
          stroke="#777"
        />

        <Tooltip
          contentStyle={tooltipStyle}
        />

        <Legend />

        <Bar
          dataKey="active"
          name="Active"
          stackId="subscription"
          fill="#3B82F6"
        />

<Bar
  dataKey="cancelled"
  name="Cancelled"
  stackId="subscription"
  fill="#60A5FA"
/>

<Bar
  dataKey="expired"
  name="Expired"
  stackId="subscription"
  fill="#93C5FD"
/>

      </BarChart>

    </ResponsiveContainer>
  );
}


    if (chartTypes.churn === "pie") {

      return (
        <ResponsiveContainer width="100%" height={330}>

          <PieChart>

            <Pie
              data={reports.churn_analysis}
              dataKey="subscription_count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={110}
              label={({ status, percent }) =>
                `${status} ${(percent * 100).toFixed(0)}%`
              }
            >

              {reports.churn_analysis.map(
                (entry, index) => (

<Cell
  key={`churn-${index}`}
  fill={
    entry.status === "active"
      ? "#3B82F6"
      : entry.status === "cancelled"
      ? "#60A5FA"
      : "#93C5FD"
  }
/>

                )
              )}

            </Pie>

            <Tooltip contentStyle={tooltipStyle} />

            <Legend />

          </PieChart>

        </ResponsiveContainer>
      );
    }


    return (
      <ResponsiveContainer width="100%" height={330}>

        <PieChart>

          <Pie
            data={reports.churn_analysis}
            dataKey="subscription_count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={4}
          >

            {reports.churn_analysis.map(
              (entry, index) => (

<Cell
  key={`churn-${index}`}
  fill={
    entry.status === "active"
      ? "#3B82F6"
      : entry.status === "cancelled"
      ? "#60A5FA"
      : "#93C5FD"
  }
/>

              )
            )}

          </Pie>

          <Tooltip contentStyle={tooltipStyle} />

          <Legend />

        </PieChart>

      </ResponsiveContainer>
    );
  };


  /* ------------------------------------
     POPULAR PLANS CHART
     ------------------------------------ */

  const renderPopularChart = () => {

    if (chartTypes.popular === "doughnut") {

      return (
        <ResponsiveContainer width="100%" height={320}>

          <PieChart>

            <Pie
              data={reports.popular_plans}
              dataKey="subscription_count"
              nameKey="plan_name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={105}
              paddingAngle={3}
            >

              {reports.popular_plans.map(
                (entry, index) => (

                  <Cell
                    key={`popular-${index}`}
                    fill={
                      [
                        "#3B82F6",
                        "#2563EB",
                        "#60A5FA",
                        "#1D4ED8",
                        "#93C5FD"
                      ][index]
                    }
                  />

                )
              )}

            </Pie>

            <Tooltip contentStyle={tooltipStyle} />

            <Legend />

          </PieChart>

        </ResponsiveContainer>
      );
    }


    return (
      <ResponsiveContainer width="100%" height={320}>

        <BarChart
          data={reports.popular_plans}
          layout="vertical"
          margin={{
            left: 10,
            right: 25
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#292929"
          />

          <XAxis
            type="number"
            allowDecimals={false}
            stroke="#777"
          />

          <YAxis
            type="category"
            dataKey="plan_name"
            width={80}
            stroke="#777"
          />

          <Tooltip contentStyle={tooltipStyle} />

          <Bar
            dataKey="subscription_count"
            name="Subscriptions"
            fill="#3B82F6"
            radius={[0, 6, 6, 0]}
          />

        </BarChart>

      </ResponsiveContainer>
    );
  };


  /* ------------------------------------
     SPENDING CHART
     ------------------------------------ */

const renderSpendingChart = () => {

  const spendingData =
    reports.highest_spending_customers.map((item) => ({
      ...item,
      total_spending: Number(item.total_spending) || 0
    }));


  if (chartTypes.spending === "doughnut") {

    return (
      <ResponsiveContainer width="100%" height={320}>

        <PieChart>

          <Pie
            data={spendingData}
            dataKey="total_spending"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={3}
          >

            {spendingData.map((entry, index) => (

              <Cell
                key={`spending-${index}`}
                fill={
                  [
                    "#3B82F6",
                    "#2563EB",
                    "#60A5FA",
                    "#1D4ED8",
                    "#93C5FD"
                  ][index % 5]
                }
              />

            ))}

          </Pie>

          <Tooltip
            formatter={(value) =>
              `₹${Number(value).toLocaleString("en-IN")}`
            }
            contentStyle={tooltipStyle}
          />

          <Legend />

        </PieChart>

      </ResponsiveContainer>
    );
  }


  return (
    <ResponsiveContainer width="100%" height={320}>

      <BarChart
        data={spendingData}
        layout="vertical"
        margin={{
          left: 10,
          right: 25
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#292929"
        />

        <XAxis
          type="number"
          stroke="#777"
        />

        <YAxis
          type="category"
          dataKey="name"
          width={80}
          stroke="#777"
        />

        <Tooltip
          formatter={(value) =>
            `₹${Number(value).toLocaleString("en-IN")}`
          }
          contentStyle={tooltipStyle}
        />

        <Bar
          dataKey="total_spending"
          name="Total Spending"
          fill="#3B82F6"
          radius={[0, 6, 6, 0]}
        />

      </BarChart>

    </ResponsiveContainer>
  );
};

  /* ------------------------------------
   PAYMENT METHOD DISTRIBUTION CHART
   ------------------------------------ */

  const renderPaymentMethodChart = () => {

   const paymentData = (reports.payment_method_distribution || []).map((item) => ({
  payment_method: String(item.payment_method || "Unknown"),
  payment_count: Number(item.payment_count || 0)
}));


  if (chartTypes.paymentMethods === "doughnut") {

    return (
      <ResponsiveContainer width="100%" height={330}>

        <PieChart>

          <Pie
            data={paymentData}
            dataKey="payment_count"
            nameKey="payment_method"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
          >

            {paymentData.map((entry, index) => (

              <Cell
                key={`payment-${index}`}
                fill={
                  [
                    "#3B82F6",
                    "#2563EB",
                    "#60A5FA",
                    "#1D4ED8",
                    "#93C5FD"
                  ][index % 5]
                }
              />

            ))}

          </Pie>

          <Tooltip contentStyle={tooltipStyle} />

          <Legend />

        </PieChart>

      </ResponsiveContainer>
    );
  }


  return (
    <ResponsiveContainer width="100%" height={330}>

      <BarChart
        data={paymentData}
        margin={{
          left: 20,
          right: 20
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#292929"
        />

        <XAxis
          dataKey="payment_method"
          stroke="#777"
        />

        <YAxis
          allowDecimals={false}
          stroke="#777"
        />

        <Tooltip contentStyle={tooltipStyle} />

        <Bar
  dataKey="payment_count"
  name="Payments"
  fill="#3B82F6"
  radius={[6, 6, 0, 0]}
  isAnimationActive={false}
/>

      </BarChart>

    </ResponsiveContainer>
  );
};

  return (

    <div className="page reports-page">

      {/* HEADER */}

      <div className="reports-header">

        <div>

          <h1>Reports</h1>

          <p>
            Analytics and insights from your subscription system
          </p>

        </div>

      </div>


      {/* KPI CARDS */}

      <div className="kpi-grid">

        <div className="kpi-card">

          <div className="kpi-icon">
            <Users size={22} />
          </div>

          <div>
            <p>Total Customers</p>
            <h2>{reports.total_customers}</h2>
          </div>

        </div>


        <div className="kpi-card">

          <div className="kpi-icon">
            <CreditCard size={22} />
          </div>

          <div>
            <p>Total Plans</p>
            <h2>{reports.total_plans}</h2>
          </div>

        </div>


        <div className="kpi-card">

          <div className="kpi-icon">
            <UserCheck size={22} />
          </div>

          <div>
            <p>Active Subscriptions</p>
            <h2>{reports.active_subscriptions}</h2>
          </div>

        </div>


        <div className="kpi-card">

          <div className="kpi-icon">
            <IndianRupee size={22} />
          </div>

          <div>
            <p>Total Revenue</p>

            <h2>
              ₹{Number(
                reports.total_revenue
              ).toLocaleString("en-IN")}
            </h2>

          </div>

        </div>

      </div>


      {/* REPORT GRID */}

      <div className="reports-grid">


        {/* MONTHLY REVENUE */}

        <div className="report-card report-card-large">

          <div className="report-heading">

            <div className="report-heading-icon">
              <TrendingUp size={20} />
            </div>

            <div className="report-heading-content">

              <div>

                <h2>Monthly Revenue</h2>

                <p>
                  Revenue generated from completed payments
                </p>

              </div>

              <select
                className="chart-selector"
                value={chartTypes.revenue}
                onChange={(e) =>
                  changeChartType(
                    "revenue",
                    e.target.value
                  )
                }
              >

                <option value="area">
                  Area Chart
                </option>

                <option value="line">
                  Line Chart
                </option>

                <option value="bar">
                  Bar Chart
                </option>

              </select>

            </div>

          </div>


          <div className="chart-container">

            {renderRevenueChart()}

          </div>

        </div>


        {/* SUBSCRIPTION CHURN */}

        <div className="report-card">

          <div className="report-heading">

            <div className="report-heading-icon">
              <PieChartIcon size={20} />
            </div>

            <div className="report-heading-content">

              <div>

                <h2>Subscription Churn</h2>

                <p>
                  Active, cancelled and expired subscriptions
                </p>

              </div>

              <select
                className="chart-selector"
                value={chartTypes.churn}
                onChange={(e) =>
                  changeChartType(
                    "churn",
                    e.target.value
                  )
                }
              >

                <option value="doughnut">
                  Doughnut
                </option>

                <option value="pie">
                  Pie Chart
                </option>

                <option value="stacked">
                  100% Stacked Bar
                </option>

              </select>

            </div>

          </div>


          <div className="chart-container">

            {renderChurnChart()}

          </div>

        </div>


        {/* POPULAR PLANS */}

        <div className="report-card">

          <div className="report-heading">

            <div className="report-heading-icon">
              <BarChart3 size={20} />
            </div>

            <div className="report-heading-content">

              <div>

                <h2>Top 5 Popular Plans</h2>

                <p>
                  Most subscribed plans
                </p>

              </div>

              <select
                className="chart-selector"
                value={chartTypes.popular}
                onChange={(e) =>
                  changeChartType(
                    "popular",
                    e.target.value
                  )
                }
              >

                <option value="horizontalBar">
                  Horizontal Bar
                </option>

                <option value="doughnut">
                  Doughnut
                </option>

              </select>

            </div>

          </div>


          <div className="chart-container">

            {renderPopularChart()}

          </div>

        </div>


        {/* HIGHEST SPENDING */}

        <div className="report-card">

          <div className="report-heading">

            <div className="report-heading-icon">
              <IndianRupee size={20} />
            </div>

            <div className="report-heading-content">

              <div>

                <h2>Highest-Spending Customers</h2>

                <p>
                  Customers ranked by spending
                </p>

              </div>

              <select
                className="chart-selector"
                value={chartTypes.spending}
                onChange={(e) =>
                  changeChartType(
                    "spending",
                    e.target.value
                  )
                }
              >

                <option value="horizontalBar">
                  Horizontal Bar
                </option>

                <option value="doughnut">
                  Doughnut
                </option>

              </select>

            </div>

          </div>


          <div className="chart-container">

            {renderSpendingChart()}

          </div>

        </div>


{/* PAYMENT METHOD DISTRIBUTION */}

<div className="report-card report-card-large">

  <div className="report-heading">

    <div className="report-heading-icon">
      <CreditCard size={20} />
    </div>

    <div className="report-heading-content">

      <div>

        <h2>Payment Method Distribution</h2>

        <p>
          Distribution of payments by payment method
        </p>

      </div>

      <select
        className="chart-selector"
        value={chartTypes.paymentMethods}
        onChange={(e) =>
          changeChartType(
            "paymentMethods",
            e.target.value
          )
        }
      >

        <option value="bar">
          Vertical Bar
        </option>

        <option value="doughnut">
          Doughnut
        </option>

      </select>

    </div>

  </div>


  <div className="chart-container">

    {renderPaymentMethodChart()}

  </div>

</div>


      </div>

    </div>

  );
}
export default Reports;