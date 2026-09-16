import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

function Customers() {

  const API_URL = import.meta.env.VITE_API_URL;
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    registration_date: ""
  });

  const loadCustomers = () => {

    return fetch(`${API_URL}/api/customers`)
      .then((response) => response.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });

  };

  useEffect(() => {
    loadCustomers();
  }, []);


  const handleChange = (event) => {

    setForm({
      ...form,
      [event.target.name]: event.target.value
    });

  };


  const openAddForm = () => {

    setEditingCustomer(null);

    setForm({
      name: "",
      email: "",
      phone: "",
      registration_date: ""
    });

    setShowForm(true);

  };


  const openEditForm = (customer) => {

    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      registration_date: customer.registration_date
        ? customer.registration_date.substring(0, 10)
        : ""
    });

    setShowForm(true);

  };


  const handleSubmit = async (event) => {

    event.preventDefault();

    const url = editingCustomer
        ? `${API_URL}/api/customers/${editingCustomer.customer_id}`
        : `${API_URL}/api/customers`;

    const method = editingCustomer ? "PUT" : "POST";

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

      loadCustomers();

    } catch (error) {

      console.error(error);
      alert("Unable to save customer");

    }

  };


  const deleteCustomer = async (customerId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {

      const response = await fetch(
        `${API_URL}/api/customers/${customerId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      loadCustomers();

    } catch (error) {

      console.error(error);
      alert("Unable to delete customer");

    }

  };


  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(search.toLowerCase()) ||
    (customer.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (customer.phone || "").includes(search)
  );


if (loading) {
    return (
        <div className="loading-screen">
            <h2>Loading customers...</h2>
        </div>
    );
}

return (
    <div className="customers-page">

      <div className="page-header">

        <div>
          <h1>Customers</h1>
          <p>Manage your subscription customers</p>
        </div>

        <button
          className="primary-button"
          onClick={openAddForm}
        >
          <Plus size={18} />
          Add Customer
        </button>

      </div>


      <div className="customer-toolbar">

        <div className="customer-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

        </div>

        <span>
          {filteredCustomers.length} customers
        </span>

      </div>


      {showForm && (

        <div className="customer-form-card">

          <div className="form-header">

            <h2>
              {editingCustomer
                ? "Edit Customer"
                : "Add Customer"}
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

                <label>Name</label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

              </div>


              <div className="form-group">

                <label>Email</label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label>Phone</label>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />

              </div>


              <div className="form-group">

                <label>Registration Date</label>

                <input
                  type="date"
                  name="registration_date"
                  value={form.registration_date}
                  onChange={handleChange}
                  required
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
                {editingCustomer
                  ? "Update Customer"
                  : "Add Customer"}
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
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>

          </thead>


          <tbody>

            {filteredCustomers.map((customer) => (

              <tr key={customer.customer_id}>

                <td>
                  #{customer.customer_id}
                </td>

                <td>
                  <strong>{customer.name}</strong>
                </td>

                <td>
                  {customer.email || "-"}
                </td>

                <td>
                  {customer.phone || "-"}
                </td>

                <td>
                  {customer.registration_date
                    ? customer.registration_date.substring(0, 10)
                    : "-"}
                </td>

                <td>

                  <div className="action-buttons">

                    <button
                      className="edit-button"
                      onClick={() => openEditForm(customer)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        deleteCustomer(customer.customer_id)
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

export default Customers;