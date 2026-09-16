import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CreditCard,
  Activity,
  IndianRupee
} from "lucide-react";

import StatCard from "../components/StatCard";

function Dashboard() {

  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {

    fetch("http://127.0.0.1:5000/api/dashboard")
      .then((response) => {

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        return response.json();

      })
      .then((data) => {

        setDashboard(data);

      })
      .catch((error) => {

        console.error(error);
        setError(error.message);

      });

  }, []);


  if (error) {

    return (
      <div className="error-screen">

        <h2>Unable to load dashboard</h2>

        <p>{error}</p>

      </div>
    );

  }


  if (!dashboard) {

    return (
      <div className="loading-screen">

        <h2>Loading dashboard...</h2>

      </div>
    );

  }


  return (

    <section className="dashboard">

      {/* HERO */}

      <div className="hero">

        <div>

          <p className="hero-label">
            SUBSCRIPTION MANAGEMENT
          </p>

          <h1>
            Manage your subscriptions
            <br />
            <span>all in one place.</span>
          </h1>

          <p className="hero-description">
            Track customers, plans, subscriptions,
            payments and usage from one powerful dashboard.
          </p>

          <button
  className="hero-button"
  onClick={() => navigate("/reports")}
>
  View Reports
</button>

        </div>

      </div>


      {/* OVERVIEW */}

      <div className="section-title">

        <h2>Overview</h2>

        <p>
          Real-time subscription statistics
        </p>

      </div>


      <div className="stats-grid">

        <StatCard
          title="Total Customers"
          value={dashboard.total_customers}
          subtitle="Registered customers"
          icon={<Users size={22} />}
        />


        <StatCard
          title="Total Plans"
          value={dashboard.total_plans}
          subtitle="Available plans"
          icon={<CreditCard size={22} />}
        />


        <StatCard
          title="Active Subscriptions"
          value={dashboard.active_subscriptions}
          subtitle="Currently active"
          icon={<Activity size={22} />}
        />


        <StatCard
          title="Total Revenue"
          value={`₹${Number(
            dashboard.total_revenue
          ).toLocaleString("en-IN")}`}
          subtitle="Completed payments"
          icon={<IndianRupee size={22} />}
        />

      </div>


      {/* POPULAR PLANS */}

      <div className="section-title">

        <h2>Popular Plans</h2>

        <p>
          Most subscribed plans
        </p>

      </div>


      <div className="plans-grid">

        {dashboard.popular_plans.map((plan, index) => (

          <div
            className="plan-card"
            key={plan.plan_id}
          >

            <div className="plan-number">

              {String(index + 1).padStart(2, "0")}

            </div>


            <h3>
              {plan.plan_name}
            </h3>


            <p>
              {plan.subscription_count} subscriptions
            </p>


            <strong>
              ₹{Number(plan.price).toLocaleString("en-IN")}
            </strong>


            <span>
              per subscription
            </span>

          </div>

        ))}

      </div>


      {/* MONTHLY REVENUE */}

      <div className="section-title">

        <h2>Monthly Revenue</h2>

        <p>
          Revenue from completed payments
        </p>

      </div>


      <div className="revenue-card">

        {dashboard.monthly_revenue.map((item) => (

          <div
            className="revenue-row"
            key={`${item.year}-${item.month}`}
          >

            <div className="revenue-label">

              <span>
                {item.year}-
                {String(item.month).padStart(2, "0")}
              </span>


              <strong>
                ₹{Number(
                  item.revenue
                ).toLocaleString("en-IN")}
              </strong>

            </div>


            <div className="revenue-bar">

              <div
                className="revenue-fill"
                style={{
                  width: `${Math.min(
                    Number(item.revenue) / 20,
                    100
                  )}%`
                }}
              ></div>

            </div>

          </div>

        ))}

      </div>


      {/* SUBSCRIPTION STATUS */}

      <div className="section-title">

        <h2>Subscription Status</h2>

        <p>
          Current subscription distribution
        </p>

      </div>


      <div className="status-grid">

        {dashboard.subscription_status.map((item) => (

          <div
            className="status-card"
            key={item.status}
          >

            <span>
              {item.status}
            </span>


            <strong>
              {item.subscription_count}
            </strong>

          </div>

        ))}

      </div>


      {/* RECENT PAYMENTS */}

      <div className="section-title">

        <h2>Recent Payments</h2>

        <p>
          Latest payment activity
        </p>

      </div>


      <div className="payments-card">

        {dashboard.recent_payments.map((payment) => (

          <div
            className="payment-row"
            key={payment.payment_id}
          >

            <div>

              <strong>
                {payment.customer_name}
              </strong>

              <span>
                {payment.plan_name}
              </span>

            </div>


            <div>

              <strong>
                ₹{Number(
                  payment.amount
                ).toLocaleString("en-IN")}
              </strong>

              <span>
                {payment.payment_date}
              </span>

            </div>


            <span className="payment-status">

              {payment.status}

            </span>

          </div>

        ))}

      </div>

    </section>

  );
}

export default Dashboard;