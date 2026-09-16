import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

function Plans() {

  const API_URL = import.meta.env.VITE_API_URL;
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState({
    plan_name: "",
    price: "",
    duration_months: "",
    description: ""
  });


  const loadPlans = () => {

    fetch(`${API_URL}/api/plans`)
      .then((response) => response.json())
      .then((data) => {
        setPlans(data);
      })
      .catch((error) => {
        console.error(error);
      });

  };


  useEffect(() => {
    loadPlans();
  }, []);


  const handleChange = (event) => {

    setForm({
      ...form,
      [event.target.name]: event.target.value
    });

  };


  const openAddForm = () => {

    setEditingPlan(null);

    setForm({
      plan_name: "",
      price: "",
      duration_months: "",
      description: ""
    });

    setShowForm(true);

  };


  const openEditForm = (plan) => {

    setEditingPlan(plan);

    setForm({
      plan_name: plan.plan_name,
      price: plan.price,
      duration_months: plan.duration_months,
      description: plan.description || ""
    });

    setShowForm(true);

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    const url = editingPlan
  ? `${API_URL}/api/plans/${editingPlan.plan_id}`
  : `${API_URL}/api/plans`;

    const method = editingPlan ? "PUT" : "POST";

    try {

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Operation failed");
      }

      setShowForm(false);

      loadPlans();

    } catch (error) {

      console.error(error);

      alert("Unable to save plan");

    }

  };


  const deletePlan = async (planId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this plan?"
    );

    if (!confirmed) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/api/plans/${planId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      loadPlans();

    } catch (error) {

      console.error(error);

      alert(
        "Unable to delete plan. It may be used by subscriptions."
      );

    }

  };


  const filteredPlans = plans.filter((plan) =>
    plan.plan_name
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    (plan.description || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );


  return (

    <div className="customers-page">

      <div className="page-header">

        <div>

          <h1>Plans</h1>

          <p>
            Manage your subscription plans
          </p>

        </div>


        <button
          className="primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Plan
        </button>

      </div>


      <div className="customer-toolbar">

        <div className="customer-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search plans..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        <span>
          {filteredPlans.length} plans
        </span>

      </div>


      {showForm && (

        <div className="customer-form-card">

          <div className="form-header">

            <h2>
              {editingPlan
                ? "Edit Plan"
                : "Add Plan"}
            </h2>


            <button
              className="close-button"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-grid">


              <div className="form-group">

                <label>
                  Plan Name
                </label>

                <input
                  type="text"
                  name="plan_name"
                  value={form.plan_name}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Duration (Months)
                </label>

                <input
                  type="number"
                  name="duration_months"
                  value={form.duration_months}
                  onChange={handleChange}
                  min="1"
                  required
                />

              </div>


              <div className="form-group">

                <label>
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  maxLength="255"
                />

              </div>

            </div>


            <div className="form-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="primary-button"
              >
                {editingPlan
                  ? "Update Plan"
                  : "Add Plan"}
              </button>

            </div>

          </form>

        </div>

      )}


      <div className="customers-table-card">

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>Plan</th>

              <th>Price</th>

              <th>Duration</th>

              <th>Description</th>

              <th>Actions</th>

            </tr>

          </thead>


          <tbody>

            {filteredPlans.map((plan) => (

              <tr key={plan.plan_id}>

                <td>
                  #{plan.plan_id}
                </td>


                <td>
                  <strong>
                    {plan.plan_name}
                  </strong>
                </td>


                <td>
                  ₹{Number(plan.price).toLocaleString("en-IN")}
                </td>


                <td>
                  {plan.duration_months} month(s)
                </td>


                <td>
                  {plan.description || "-"}
                </td>


                <td>

                  <div className="action-buttons">

                    <button
                      className="edit-button"
                      onClick={() =>
                        openEditForm(plan)
                      }
                    >
                      <Pencil size={16} />
                    </button>


                    <button
                      className="delete-button"
                      onClick={() =>
                        deletePlan(plan.plan_id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}

export default Plans;