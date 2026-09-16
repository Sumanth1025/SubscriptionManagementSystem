import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Search
} from "lucide-react";

function Subscriptions() {

  const [subscriptions, setSubscriptions] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingSubscription, setEditingSubscription] =
    useState(null);

  const [form, setForm] = useState({
    customer_id: "",
    plan_id: "",
    start_date: "",
    status: "active"
  });


  // LOAD SUBSCRIPTIONS

  const loadSubscriptions = () => {

    fetch("http://127.0.0.1:5000/api/subscriptions")
      .then((response) => response.json())
      .then((data) => {
        setSubscriptions(data);
      })
      .catch((error) => {
        console.error(error);
      });

  };


  // LOAD CUSTOMERS

  const loadCustomers = () => {

    fetch("http://127.0.0.1:5000/api/subscription-customers")
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data);
      })
      .catch((error) => {
        console.error(error);
      });

  };


  // LOAD PLANS

  const loadPlans = () => {

    fetch("http://127.0.0.1:5000/api/subscription-plans")
      .then((response) => response.json())
      .then((data) => {
        setPlans(data);
      })
      .catch((error) => {
        console.error(error);
      });

  };


  // LOAD ALL DATA

  useEffect(() => {

    loadSubscriptions();
    loadCustomers();
    loadPlans();

  }, []);


  // HANDLE INPUT

  const handleChange = (event) => {

    setForm({
      ...form,
      [event.target.name]: event.target.value
    });

  };


  // OPEN ADD FORM

  const openAddForm = () => {

    setEditingSubscription(null);

    setForm({
      customer_id: "",
      plan_id: "",
      start_date: "",
      status: "active"
    });

    setShowForm(true);

  };


  // OPEN EDIT FORM

  const openEditForm = (subscription) => {

    setEditingSubscription(subscription);

    setForm({
      customer_id: subscription.customer_id,
      plan_id: subscription.plan_id,
      start_date: subscription.start_date
        ? subscription.start_date.substring(0, 10)
        : "",
      status: subscription.status
    });

    setShowForm(true);

  };


  // ADD / UPDATE

  const handleSubmit = async (event) => {

    event.preventDefault();

    const url = editingSubscription
      ? `http://127.0.0.1:5000/api/subscriptions/${editingSubscription.subscription_id}`
      : "http://127.0.0.1:5000/api/subscriptions";

    const method = editingSubscription
      ? "PUT"
      : "POST";


    try {

      const response = await fetch(url, {

        method: method,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(form)

      });


      const result = await response.json();


      if (!response.ok) {

        throw new Error(
          result.error || "Operation failed"
        );

      }


      setShowForm(false);

      setEditingSubscription(null);

      loadSubscriptions();


    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  };


  // DELETE

  const deleteSubscription = async (subscriptionId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this subscription?"
    );


    if (!confirmed) {
      return;
    }


    try {

      const response = await fetch(
        `http://127.0.0.1:5000/api/subscriptions/${subscriptionId}`,
        {
          method: "DELETE"
        }
      );


      const result = await response.json();


      if (!response.ok) {

        throw new Error(
          result.error || "Delete failed"
        );

      }


      loadSubscriptions();


    } catch (error) {

      console.error(error);

      alert(error.message);

    }

  };


  // SEARCH

  const filteredSubscriptions =
    subscriptions.filter((subscription) => {

      const searchText = search.toLowerCase();

      return (
        String(subscription.subscription_id)
          .includes(searchText) ||

        subscription.customer_name
          .toLowerCase()
          .includes(searchText) ||

        subscription.plan_name
          .toLowerCase()
          .includes(searchText) ||

        subscription.status
          .toLowerCase()
          .includes(searchText)
      );

    });


  return (

    <div className="customers-page">


      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <h1>
            Subscriptions
          </h1>

          <p>
            Manage customer subscriptions
          </p>

        </div>


        <button
          className="primary-button"
          onClick={openAddForm}
        >

          <Plus size={18} />

          Add Subscription

        </button>

      </div>


      {/* SEARCH */}

      <div className="customer-toolbar">

        <div className="customer-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search subscriptions..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        <span>

          {filteredSubscriptions.length}
          {" "}
          subscriptions

        </span>

      </div>


      {/* FORM */}

      {showForm && (

        <div className="customer-form-card">


          <div className="form-header">

            <h2>

              {editingSubscription
                ? "Edit Subscription"
                : "Add Subscription"}

            </h2>


            <button
              className="close-button"
              onClick={() =>
                setShowForm(false)
              }
            >

              ×

            </button>

          </div>


          <form onSubmit={handleSubmit}>


            <div className="form-grid">


              {/* CUSTOMER */}

              <div className="form-group">

                <label>
                  Customer
                </label>


                <select
                  name="customer_id"
                  value={form.customer_id}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Customer
                  </option>


                  {customers.map((customer) => (

                    <option
                      key={customer.customer_id}
                      value={customer.customer_id}
                    >

                      {customer.name}

                    </option>

                  ))}

                </select>

              </div>


              {/* PLAN */}

              <div className="form-group">

                <label>
                  Plan
                </label>


                <select
                  name="plan_id"
                  value={form.plan_id}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Select Plan
                  </option>


                  {plans.map((plan) => (

                    <option
                      key={plan.plan_id}
                      value={plan.plan_id}
                    >

                      {plan.plan_name}
                      {" - ₹"}
                      {Number(plan.price).toLocaleString("en-IN")}
                      {" / "}
                      {plan.duration_months}
                      {" month(s)"}

                    </option>

                  ))}

                </select>

              </div>


              {/* START DATE */}

              <div className="form-group">

                <label>
                  Start Date
                </label>


                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />

              </div>


              {/* STATUS */}

              <div className="form-group">

                <label>
                  Status
                </label>


                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  required
                >

                  <option value="active">
                    Active
                  </option>

                  <option value="expired">
                    Expired
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                </select>

              </div>

            </div>


            <div className="form-actions">


              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowForm(false)
                }
              >

                Cancel

              </button>


              <button
                type="submit"
                className="primary-button"
              >

                {editingSubscription
                  ? "Update Subscription"
                  : "Add Subscription"}

              </button>


            </div>

          </form>

        </div>

      )}


      {/* TABLE */}

      <div className="customers-table-card">

        <table>


          <thead>

            <tr>

              <th>
                ID
              </th>

              <th>
                Customer
              </th>

              <th>
                Plan
              </th>

              <th>
                Price
              </th>

              <th>
                Start Date
              </th>

              <th>
                End Date
              </th>

              <th>
                Status
              </th>

              <th>
                Actions
              </th>

            </tr>

          </thead>


          <tbody>

            {filteredSubscriptions.map(
              (subscription) => (

                <tr
                  key={subscription.subscription_id}
                >


                  <td>

                    #{subscription.subscription_id}

                  </td>


                  <td>

                    <strong>
                      {subscription.customer_name}
                    </strong>

                  </td>


                  <td>

                    {subscription.plan_name}

                  </td>


                  <td>

                    ₹{Number(
                      subscription.price
                    ).toLocaleString("en-IN")}

                  </td>


                  <td>

                    {subscription.start_date
                      ? subscription.start_date.substring(
                          0,
                          10
                        )
                      : "-"}

                  </td>


                  <td>

                    {subscription.end_date
                      ? subscription.end_date.substring(
                          0,
                          10
                        )
                      : "-"}

                  </td>


                  <td>

                    <span
                      className={`subscription-status ${subscription.status.toLowerCase()}`}
                    >

                      {subscription.status}

                    </span>

                  </td>


                  <td>

                    <div className="action-buttons">


                      <button
                        className="edit-button"
                        onClick={() =>
                          openEditForm(subscription)
                        }
                      >

                        <Pencil size={16} />

                      </button>


                      <button
                        className="delete-button"
                        onClick={() =>
                          deleteSubscription(
                            subscription.subscription_id
                          )
                        }
                      >

                        <Trash2 size={16} />

                      </button>


                    </div>

                  </td>


                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}

export default Subscriptions;