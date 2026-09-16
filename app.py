from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_cors import CORS
import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY",
    "development-secret-key"
)

CORS(app)

def get_db_connection():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        port=int(os.getenv("DB_PORT", 3306))
    )
    return connection

@app.route("/")
def dashboard():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("select count(*) from customers")
    total_customers = cursor.fetchone()[0]

    cursor.execute("select count(*) from plans")
    total_plans = cursor.fetchone()[0]

    cursor.execute("select count(*) from subscriptions where status = 'active'")
    active_subscriptions = cursor.fetchone()[0]

    cursor.execute(
        "select coalesce(sum(amount), 0) from payments where status = 'completed'"
    )
    total_revenue = cursor.fetchone()[0]

    cursor.close()
    connection.close()

    return render_template(
        "dashboard.html",
        total_customers=total_customers,
        total_plans=total_plans,
        active_subscriptions=active_subscriptions,
        total_revenue=total_revenue
    )


@app.route("/customers")
def customers():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("select * from customers")
    customers = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template("customers.html", customers=customers)


@app.route("/add-customer", methods=["GET", "POST"])
def add_customer():

    if request.method == "POST":

        name = request.form["name"]
        email = request.form["email"]
        phone = request.form["phone"]
        registration_date = request.form["registration_date"]

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("select coalesce(max(customer_id), 0) + 1 from customers")
        customer_id = cursor.fetchone()[0]

        query = """
            insert into customers
            (customer_id, name, email, phone, registration_date)
            values (%s, %s, %s, %s, %s)
        """

        values = (
            customer_id,
            name,
            email,
            phone,
            registration_date
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("customers"))

    return render_template("add_customer.html")


@app.route("/edit-customer/<int:customer_id>", methods=["GET", "POST"])
def edit_customer(customer_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        name = request.form["name"]
        email = request.form["email"]
        phone = request.form["phone"]
        registration_date = request.form["registration_date"]

        query = """
            update customers
            set name = %s,
                email = %s,
                phone = %s,
                registration_date = %s
            where customer_id = %s
        """

        values = (
            name,
            email,
            phone,
            registration_date,
            customer_id
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("customers"))

    cursor.execute(
        "select * from customers where customer_id = %s",
        (customer_id,)
    )

    customer = cursor.fetchone()

    cursor.close()
    connection.close()

    return render_template(
        "edit_customer.html",
        customer=customer
    )

@app.route("/delete-customer/<int:customer_id>")
def delete_customer(customer_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "delete from customers where customer_id = %s",
        (customer_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return redirect(url_for("customers"))


@app.route("/plans")
def plans():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("select * from plans")
    plans = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template("plans.html", plans=plans)


@app.route("/add-plan", methods=["GET", "POST"])
def add_plan():

    if request.method == "POST":

        plan_name = request.form["plan_name"]
        price = request.form["price"]
        duration_months = request.form["duration_months"]
        description = request.form["description"]

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("select coalesce(max(plan_id), 0) + 1 from plans")
        plan_id = cursor.fetchone()[0]

        query = """
            insert into plans
            (plan_id, plan_name, price, duration_months, description)
            values (%s, %s, %s, %s, %s)
        """

        values = (
            plan_id,
            plan_name,
            price,
            duration_months,
            description
        )

        cursor.execute(query, values)
        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("plans"))

    return render_template("add_plan.html")

@app.route("/edit-plan/<int:plan_id>", methods=["GET", "POST"])
def edit_plan(plan_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        plan_name = request.form["plan_name"]
        price = request.form["price"]
        duration_months = request.form["duration_months"]
        description = request.form["description"]

        query = """
            update plans
            set plan_name = %s,
                price = %s,
                duration_months = %s,
                description = %s
            where plan_id = %s
        """

        values = (
            plan_name,
            price,
            duration_months,
            description,
            plan_id
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("plans"))

    cursor.execute(
        "select * from plans where plan_id = %s",
        (plan_id,)
    )

    plan = cursor.fetchone()

    cursor.close()
    connection.close()

    return render_template(
        "edit_plan.html",
        plan=plan
    )

@app.route("/delete-plan/<int:plan_id>")
def delete_plan(plan_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "delete from plans where plan_id = %s",
        (plan_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return redirect(url_for("plans"))


@app.route("/subscriptions")
def subscriptions():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        select
            s.subscription_id,
            c.name,
            p.plan_name,
            p.price,
            s.start_date,
            s.end_date,
            s.status
        from subscriptions s
        join customers c
            on s.customer_id = c.customer_id
        join plans p
            on s.plan_id = p.plan_id
        order by s.subscription_id
    """)

    subscriptions = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "subscriptions.html",
        subscriptions=subscriptions
    )

@app.route("/add-subscription", methods=["GET", "POST"])
def add_subscription():

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        customer_id = request.form["customer_id"]
        plan_id = request.form["plan_id"]
        start_date = request.form["start_date"]

        cursor.execute(
            "select coalesce(max(subscription_id), 0) + 1 from subscriptions"
        )

        subscription_id = cursor.fetchone()[0]

        cursor.execute(
            "select duration_months from plans where plan_id = %s",
            (plan_id,)
        )

        duration = cursor.fetchone()[0]

        query = """
            insert into subscriptions
            (subscription_id, customer_id, plan_id, start_date, end_date, status)
            values (
                %s,
                %s,
                %s,
                %s,
                date_add(%s, interval %s month),
                'active'
            )
        """

        values = (
            subscription_id,
            customer_id,
            plan_id,
            start_date,
            start_date,
            duration
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("subscriptions"))

    cursor.execute(
        "select customer_id, name from customers order by name"
    )
    customers = cursor.fetchall()

    cursor.execute(
        "select plan_id, plan_name, price, duration_months from plans order by plan_name"
    )
    plans = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "add_subscription.html",
        customers=customers,
        plans=plans
    )


@app.route("/edit-subscription/<int:subscription_id>", methods=["GET", "POST"])
def edit_subscription(subscription_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        customer_id = request.form["customer_id"]
        plan_id = request.form["plan_id"]
        start_date = request.form["start_date"]
        end_date = request.form["end_date"]
        status = request.form["status"]

        query = """
            update subscriptions
            set customer_id = %s,
                plan_id = %s,
                start_date = %s,
                end_date = %s,
                status = %s
            where subscription_id = %s
        """

        values = (
            customer_id,
            plan_id,
            start_date,
            end_date,
            status,
            subscription_id
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("subscriptions"))

    cursor.execute(
        "select * from subscriptions where subscription_id = %s",
        (subscription_id,)
    )

    subscription = cursor.fetchone()

    cursor.execute(
        "select customer_id, name from customers order by customer_id"
    )

    customers = cursor.fetchall()

    cursor.execute(
        "select plan_id, plan_name from plans order by plan_id"
    )

    plans = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "edit_subscription.html",
        subscription=subscription,
        customers=customers,
        plans=plans
    )


@app.route("/delete-subscription/<int:subscription_id>")
def delete_subscription(subscription_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            "delete from payments where subscription_id = %s",
            (subscription_id,)
        )

        cursor.execute(
            "delete from usage_details where subscription_id = %s",
            (subscription_id,)
        )

        cursor.execute(
            "delete from subscriptions where subscription_id = %s",
            (subscription_id,)
        )

        connection.commit()

    except Exception as error:

        connection.rollback()

        print("Error deleting subscription:", error)

    finally:

        cursor.close()
        connection.close()

    return redirect(url_for("subscriptions"))


@app.route("/payments")
def payments():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        select
            p.payment_id,
            c.name,
            pl.plan_name,
            p.amount,
            p.payment_date,
            p.payment_method,
            p.status
        from payments p
        join subscriptions s
            on p.subscription_id = s.subscription_id
        join customers c
            on s.customer_id = c.customer_id
        join plans pl
            on s.plan_id = pl.plan_id
        order by p.payment_id
    """)

    payments = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template("payments.html", payments=payments)

@app.route("/add-payment", methods=["GET", "POST"])
def add_payment():

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        subscription_id = request.form["subscription_id"]
        amount = request.form["amount"]
        payment_date = request.form["payment_date"]
        payment_method = request.form["payment_method"]
        status = request.form["status"]

        cursor.execute(
            "select coalesce(max(payment_id), 0) + 1 from payments"
        )

        payment_id = cursor.fetchone()[0]

        query = """
            insert into payments
            (payment_id, subscription_id, amount, payment_date, payment_method, status)
            values (%s, %s, %s, %s, %s, %s)
        """

        values = (
            payment_id,
            subscription_id,
            amount,
            payment_date,
            payment_method,
            status
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("payments"))

    cursor.execute("""
        select
            s.subscription_id,
            c.name,
            p.plan_name
        from subscriptions s
        join customers c
            on s.customer_id = c.customer_id
        join plans p
            on s.plan_id = p.plan_id
        order by s.subscription_id
    """)

    subscriptions = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "add_payment.html",
        subscriptions=subscriptions
    )


@app.route("/edit-payment/<int:payment_id>", methods=["GET", "POST"])
def edit_payment(payment_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        amount = request.form["amount"]
        payment_date = request.form["payment_date"]
        payment_method = request.form["payment_method"]
        status = request.form["status"]

        query = """
            update payments
            set amount = %s,
                payment_date = %s,
                payment_method = %s,
                status = %s
            where payment_id = %s
        """

        values = (
            amount,
            payment_date,
            payment_method,
            status,
            payment_id
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("payments"))

    cursor.execute(
        "select * from payments where payment_id = %s",
        (payment_id,)
    )

    payment = cursor.fetchone()

    cursor.close()
    connection.close()

    return render_template(
        "edit_payment.html",
        payment=payment
    )


@app.route("/delete-payment/<int:payment_id>")
def delete_payment(payment_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "delete from payments where payment_id = %s",
        (payment_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return redirect(url_for("payments"))


@app.route("/usage")
def usage():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        select
            u.usage_id,
            c.name,
            p.plan_name,
            u.usage_date,
            u.usage_amount
        from usage_details u
        join subscriptions s
            on u.subscription_id = s.subscription_id
        join customers c
            on s.customer_id = c.customer_id
        join plans p
            on s.plan_id = p.plan_id
        order by u.usage_id
    """)

    usage_details = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "usage.html",
        usage_details=usage_details
    )

@app.route("/add-usage", methods=["GET", "POST"])
def add_usage():

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        subscription_id = request.form["subscription_id"]
        usage_date = request.form["usage_date"]
        usage_amount = request.form["usage_amount"]

        cursor.execute(
            "select coalesce(max(usage_id), 0) + 1 from usage_details"
        )

        usage_id = cursor.fetchone()[0]

        query = """
            insert into usage_details
            (usage_id, subscription_id, usage_date, usage_amount)
            values (%s, %s, %s, %s)
        """

        values = (
            usage_id,
            subscription_id,
            usage_date,
            usage_amount
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("usage"))

    cursor.execute("""
        select
            s.subscription_id,
            c.name,
            p.plan_name
        from subscriptions s
        join customers c
            on s.customer_id = c.customer_id
        join plans p
            on s.plan_id = p.plan_id
        order by s.subscription_id
    """)

    subscriptions = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "add_usage.html",
        subscriptions=subscriptions
    )


@app.route("/edit-usage/<int:usage_id>", methods=["GET", "POST"])
def edit_usage(usage_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        usage_date = request.form["usage_date"]
        usage_amount = request.form["usage_amount"]

        query = """
            update usage_details
            set usage_date = %s,
                usage_amount = %s
            where usage_id = %s
        """

        values = (
            usage_date,
            usage_amount,
            usage_id
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("usage"))

    cursor.execute(
        "select * from usage_details where usage_id = %s",
        (usage_id,)
    )

    usage_detail = cursor.fetchone()

    cursor.close()
    connection.close()

    return render_template(
        "edit_usage.html",
        usage_detail=usage_detail
    )


@app.route("/delete-usage/<int:usage_id>")
def delete_usage(usage_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "delete from usage_details where usage_id = %s",
        (usage_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return redirect(url_for("usage"))


@app.route("/discounts")
def discounts():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        select
            d.discount_id,
            p.plan_name,
            p.price,
            d.discount_percentage,
            d.valid_from,
            d.valid_to
        from discounts d
        join plans p
            on d.plan_id = p.plan_id
        order by d.discount_id
    """)

    discounts = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "discounts.html",
        discounts=discounts
    )

@app.route("/add-discount", methods=["GET", "POST"])
def add_discount():

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        plan_id = request.form["plan_id"]
        discount_percentage = request.form["discount_percentage"]
        valid_from = request.form["valid_from"]
        valid_to = request.form["valid_to"]

        cursor.execute(
            "select coalesce(max(discount_id), 0) + 1 from discounts"
        )

        discount_id = cursor.fetchone()[0]

        query = """
            insert into discounts
            (discount_id, plan_id, discount_percentage, valid_from, valid_to)
            values (%s, %s, %s, %s, %s)
        """

        values = (
            discount_id,
            plan_id,
            discount_percentage,
            valid_from,
            valid_to
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("discounts"))

    cursor.execute("""
        select
            plan_id,
            plan_name,
            price
        from plans
        order by plan_id
    """)

    plans = cursor.fetchall()

    cursor.close()
    connection.close()

    return render_template(
        "add_discount.html",
        plans=plans
    )


@app.route("/edit-discount/<int:discount_id>", methods=["GET", "POST"])
def edit_discount(discount_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    if request.method == "POST":

        discount_percentage = request.form["discount_percentage"]
        valid_from = request.form["valid_from"]
        valid_to = request.form["valid_to"]

        query = """
            update discounts
            set discount_percentage = %s,
                valid_from = %s,
                valid_to = %s
            where discount_id = %s
        """

        values = (
            discount_percentage,
            valid_from,
            valid_to,
            discount_id
        )

        cursor.execute(query, values)

        connection.commit()

        cursor.close()
        connection.close()

        return redirect(url_for("discounts"))

    cursor.execute(
        "select * from discounts where discount_id = %s",
        (discount_id,)
    )

    discount = cursor.fetchone()

    cursor.close()
    connection.close()

    return render_template(
        "edit_discount.html",
        discount=discount
    )


@app.route("/delete-discount/<int:discount_id>")
def delete_discount(discount_id):

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "delete from discounts where discount_id = %s",
        (discount_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return redirect(url_for("discounts"))


@app.route("/reports")
def reports():

    connection = get_db_connection()
    cursor = connection.cursor()

    # 1. top 5 popular plans

    cursor.execute("""
        select
            p.plan_id,
            p.plan_name,
            count(s.subscription_id) as subscription_count
        from plans p
        join subscriptions s
            on p.plan_id = s.plan_id
        group by p.plan_id, p.plan_name
        order by subscription_count desc
        limit 5
    """)

    popular_plans = cursor.fetchall()


    # 2. highest-spending customers

    cursor.execute("""
        select
            c.customer_id,
            c.name,
            sum(p.amount) as total_spending
        from customers c
        join subscriptions s
            on c.customer_id = s.customer_id
        join payments p
            on s.subscription_id = p.subscription_id
        where p.status = 'completed'
        group by c.customer_id, c.name
        order by total_spending desc
        limit 5
    """)

    top_customers = cursor.fetchall()


    # 3. monthly revenue

    cursor.execute("""
        select
            year(payment_date) as year,
            month(payment_date) as month,
            sum(amount) as monthly_revenue
        from payments
        where status = 'completed'
        group by year(payment_date), month(payment_date)
        order by year(payment_date), month(payment_date)
    """)

    monthly_revenue = cursor.fetchall()


    # 4. plan-wise subscription count

    cursor.execute("""
        select
            p.plan_id,
            p.plan_name,
            count(s.subscription_id) as subscription_count
        from plans p
        left join subscriptions s
            on p.plan_id = s.plan_id
        group by p.plan_id, p.plan_name
        order by subscription_count desc
    """)

    plan_subscription_count = cursor.fetchall()


    # 5. churn analysis

    cursor.execute("""
        select
            status,
            count(*) as subscription_count,
            round(
                count(*) * 100.0 /
                (select count(*) from subscriptions),
                2
            ) as percentage
        from subscriptions
        group by status
    """)

    churn_analysis = cursor.fetchall()


    cursor.close()
    connection.close()

    return render_template(
        "reports.html",
        popular_plans=popular_plans,
        top_customers=top_customers,
        monthly_revenue=monthly_revenue,
        plan_subscription_count=plan_subscription_count,
        churn_analysis=churn_analysis
    )






@app.route('/api/dashboard')
def api_dashboard():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("select count(*) as total_customers from customers")
    total_customers = cursor.fetchone()["total_customers"]

    cursor.execute("select count(*) as total_plans from plans")
    total_plans = cursor.fetchone()["total_plans"]

    cursor.execute("select count(*) as active_subscriptions from subscriptions where lower(status) = 'active'")
    active_subscriptions = cursor.fetchone()["active_subscriptions"]

    cursor.execute("select coalesce(sum(amount), 0) as total_revenue from payments where lower(status) = 'completed'")
    total_revenue = cursor.fetchone()["total_revenue"]

    cursor.execute("""
        select p.plan_id, p.plan_name, p.price,
               count(s.subscription_id) as subscription_count
        from plans p
        left join subscriptions s on p.plan_id = s.plan_id
        group by p.plan_id, p.plan_name, p.price
        order by subscription_count desc
        limit 5
    """)
    popular_plans = cursor.fetchall()

    cursor.execute("""
        select year(payment_date) as year,
               month(payment_date) as month,
               sum(amount) as revenue
        from payments
        where lower(status) = 'completed'
        group by year(payment_date), month(payment_date)
        order by year(payment_date), month(payment_date)
    """)
    monthly_revenue = cursor.fetchall()

    cursor.execute("""
        select status, count(*) as subscription_count
        from subscriptions
        group by status
    """)
    subscription_status = cursor.fetchall()

    cursor.execute("""
        select p.payment_id,
               c.name as customer_name,
               pl.plan_name,
               p.amount,
               p.payment_date,
               p.payment_method,
               p.status
        from payments p
        join subscriptions s on p.subscription_id = s.subscription_id
        join customers c on s.customer_id = c.customer_id
        join plans pl on s.plan_id = pl.plan_id
        order by p.payment_date desc
        limit 5
    """)
    recent_payments = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({
        "total_customers": total_customers,
        "total_plans": total_plans,
        "active_subscriptions": active_subscriptions,
        "total_revenue": float(total_revenue),
        "popular_plans": popular_plans,
        "monthly_revenue": monthly_revenue,
        "subscription_status": subscription_status,
        "recent_payments": recent_payments
    })



@app.route('/api/customers')
def api_customers():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("select * from customers")

    customers = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(customers)


@app.route('/api/customers', methods=['POST'])
def api_add_customer():
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    registration_date = data.get('registration_date')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("select coalesce(max(customer_id), 0) + 1 from customers")
    customer_id = cursor.fetchone()[0]

    cursor.execute(
        "insert into customers (customer_id, name, email, phone, registration_date) values (%s, %s, %s, %s, %s)",
        (customer_id, name, email, phone, registration_date)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "customer added successfully",
        "customer_id": customer_id
    }), 201

@app.route('/api/customers/<int:customer_id>', methods=['PUT'])
def api_edit_customer(customer_id):
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    registration_date = data.get('registration_date')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "update customers set name = %s, email = %s, phone = %s, registration_date = %s where customer_id = %s",
        (name, email, phone, registration_date, customer_id)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "customer updated successfully"
    })

@app.route('/api/customers/<int:customer_id>', methods=['DELETE'])
def api_delete_customer(customer_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "delete from customers where customer_id = %s",
        (customer_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "customer deleted successfully"
    })


@app.route('/api/plans')
def api_plans():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("select * from plans")

    plans = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(plans)


@app.route('/api/plans', methods=['POST'])
def api_add_plan():
    data = request.get_json()

    plan_name = data.get('plan_name')
    price = data.get('price')
    duration_months = data.get('duration_months')
    description = data.get('description')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("select coalesce(max(plan_id), 0) + 1 from plans")
    plan_id = cursor.fetchone()[0]

    cursor.execute(
        "insert into plans (plan_id, plan_name, price, duration_months, description) values (%s, %s, %s, %s, %s)",
        (plan_id, plan_name, price, duration_months, description)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "plan added successfully",
        "plan_id": plan_id
    }), 201


@app.route('/api/plans/<int:plan_id>', methods=['PUT'])
def api_edit_plan(plan_id):
    data = request.get_json()

    plan_name = data.get('plan_name')
    price = data.get('price')
    duration_months = data.get('duration_months')
    description = data.get('description')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "update plans set plan_name = %s, price = %s, duration_months = %s, description = %s where plan_id = %s",
        (plan_name, price, duration_months, description, plan_id)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "plan updated successfully"
    })


@app.route('/api/plans/<int:plan_id>', methods=['DELETE'])
def api_delete_plan(plan_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "delete from plans where plan_id = %s",
        (plan_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "plan deleted successfully"
    })


@app.route('/api/subscriptions')
def api_subscriptions():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        select s.subscription_id,
               s.customer_id,
               c.name as customer_name,
               s.plan_id,
               p.plan_name,
               p.price,
               p.duration_months,
               s.start_date,
               s.end_date,
               s.status
        from subscriptions s
        join customers c on s.customer_id = c.customer_id
        join plans p on s.plan_id = p.plan_id
        order by s.subscription_id
    """)

    subscriptions = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(subscriptions)


@app.route('/api/subscription-customers')
def api_subscription_customers():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        "select customer_id, name from customers order by name"
    )

    customers = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(customers)


@app.route('/api/subscription-plans')
def api_subscription_plans():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        select plan_id, plan_name, price, duration_months
        from plans
        order by plan_id
    """)

    plans = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(plans)


@app.route('/api/subscriptions', methods=['POST'])
def api_add_subscription():
    data = request.get_json()

    customer_id = data.get('customer_id')
    plan_id = data.get('plan_id')
    start_date = data.get('start_date')
    status = data.get('status', 'active')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "select duration_months from plans where plan_id = %s",
        (plan_id,)
    )

    result = cursor.fetchone()

    if not result:
        cursor.close()
        connection.close()

        return jsonify({
            "error": "plan not found"
        }), 404

    duration_months = result[0]

    cursor.execute(
        "select coalesce(max(subscription_id), 0) + 1 from subscriptions"
    )

    subscription_id = cursor.fetchone()[0]

    cursor.execute(
        """
        insert into subscriptions
        (subscription_id, customer_id, plan_id, start_date, end_date, status)
        values
        (%s, %s, %s, %s, date_add(%s, interval %s month), %s)
        """,
        (
            subscription_id,
            customer_id,
            plan_id,
            start_date,
            start_date,
            duration_months,
            status
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "subscription added successfully",
        "subscription_id": subscription_id
    }), 201


@app.route('/api/subscriptions/<int:subscription_id>', methods=['PUT'])
def api_edit_subscription(subscription_id):
    data = request.get_json()

    customer_id = data.get('customer_id')
    plan_id = data.get('plan_id')
    start_date = data.get('start_date')
    status = data.get('status')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "select duration_months from plans where plan_id = %s",
        (plan_id,)
    )

    result = cursor.fetchone()

    if not result:
        cursor.close()
        connection.close()

        return jsonify({
            "error": "plan not found"
        }), 404

    duration_months = result[0]

    cursor.execute(
        """
        update subscriptions
        set customer_id = %s,
            plan_id = %s,
            start_date = %s,
            end_date = date_add(%s, interval %s month),
            status = %s
        where subscription_id = %s
        """,
        (
            customer_id,
            plan_id,
            start_date,
            start_date,
            duration_months,
            status,
            subscription_id
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "subscription updated successfully"
    })


@app.route('/api/subscriptions/<int:subscription_id>', methods=['DELETE'])
def api_delete_subscription(subscription_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            "delete from payments where subscription_id = %s",
            (subscription_id,)
        )

        cursor.execute(
            "delete from usage_details where subscription_id = %s",
            (subscription_id,)
        )

        cursor.execute(
            "delete from subscriptions where subscription_id = %s",
            (subscription_id,)
        )

        connection.commit()

        return jsonify({
            "message": "subscription deleted successfully"
        })

    except Exception as error:

        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        connection.close()


@app.route('/api/payments')
def api_payments():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        select p.payment_id,
               p.subscription_id,
               c.name as customer_name,
               pl.plan_name,
               p.amount,
               p.payment_date,
               p.payment_method,
               p.status
        from payments p
        join subscriptions s on p.subscription_id = s.subscription_id
        join customers c on s.customer_id = c.customer_id
        join plans pl on s.plan_id = pl.plan_id
        order by p.payment_id
    """)

    payments = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(payments)


@app.route('/api/payment-subscriptions')
def api_payment_subscriptions():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        select s.subscription_id,
               c.name as customer_name,
               p.plan_name,
               p.price
        from subscriptions s
        join customers c on s.customer_id = c.customer_id
        join plans p on s.plan_id = p.plan_id
        order by s.subscription_id
    """)

    subscriptions = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(subscriptions)


@app.route('/api/payments', methods=['POST'])
def api_add_payment():
    data = request.get_json()

    subscription_id = data.get('subscription_id')
    amount = data.get('amount')
    payment_date = data.get('payment_date')
    payment_method = data.get('payment_method')
    status = data.get('status')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "select coalesce(max(payment_id), 0) + 1 from payments"
    )

    payment_id = cursor.fetchone()[0]

    cursor.execute(
        """
        insert into payments
        (payment_id, subscription_id, amount, payment_date, payment_method, status)
        values (%s, %s, %s, %s, %s, %s)
        """,
        (
            payment_id,
            subscription_id,
            amount,
            payment_date,
            payment_method,
            status
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "payment added successfully",
        "payment_id": payment_id
    }), 201


@app.route('/api/payments/<int:payment_id>', methods=['PUT'])
def api_edit_payment(payment_id):
    data = request.get_json()

    subscription_id = data.get('subscription_id')
    amount = data.get('amount')
    payment_date = data.get('payment_date')
    payment_method = data.get('payment_method')
    status = data.get('status')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        update payments
        set subscription_id = %s,
            amount = %s,
            payment_date = %s,
            payment_method = %s,
            status = %s
        where payment_id = %s
        """,
        (
            subscription_id,
            amount,
            payment_date,
            payment_method,
            status,
            payment_id
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "payment updated successfully"
    })


@app.route('/api/payments/<int:payment_id>', methods=['DELETE'])
def api_delete_payment(payment_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "delete from payments where payment_id = %s",
        (payment_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "payment deleted successfully"
    })


@app.route('/api/usage')
def api_usage():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        select u.usage_id,
               u.subscription_id,
               c.name as customer_name,
               p.plan_name,
               u.usage_date,
               u.usage_amount
        from usage_details u
        join subscriptions s on u.subscription_id = s.subscription_id
        join customers c on s.customer_id = c.customer_id
        join plans p on s.plan_id = p.plan_id
        order by u.usage_id
    """)

    usage = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(usage)


@app.route('/api/usage-subscriptions')
def api_usage_subscriptions():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        select s.subscription_id,
               c.name as customer_name,
               p.plan_name
        from subscriptions s
        join customers c on s.customer_id = c.customer_id
        join plans p on s.plan_id = p.plan_id
        order by s.subscription_id
    """)

    subscriptions = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(subscriptions)


@app.route('/api/usage', methods=['POST'])
def api_add_usage():
    data = request.get_json()

    subscription_id = data.get('subscription_id')
    usage_date = data.get('usage_date')
    usage_amount = data.get('usage_amount')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "select coalesce(max(usage_id), 0) + 1 from usage_details"
    )

    usage_id = cursor.fetchone()[0]

    cursor.execute(
        """
        insert into usage_details
        (usage_id, subscription_id, usage_date, usage_amount)
        values (%s, %s, %s, %s)
        """,
        (usage_id, subscription_id, usage_date, usage_amount)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "usage added successfully",
        "usage_id": usage_id
    }), 201



@app.route('/api/usage/<int:usage_id>', methods=['PUT'])
def api_edit_usage(usage_id):
    data = request.get_json()

    subscription_id = data.get('subscription_id')
    usage_date = data.get('usage_date')
    usage_amount = data.get('usage_amount')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        update usage_details
        set subscription_id = %s,
            usage_date = %s,
            usage_amount = %s
        where usage_id = %s
        """,
        (subscription_id, usage_date, usage_amount, usage_id)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "usage updated successfully"
    })


@app.route('/api/discounts')
def api_discounts():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        select d.discount_id,
               d.plan_id,
               p.plan_name,
               p.price,
               d.discount_percentage,
               d.valid_from,
               d.valid_to
        from discounts d
        join plans p on d.plan_id = p.plan_id
        order by d.discount_id
    """)

    discounts = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(discounts)


@app.route('/api/discount-plans')
def api_discount_plans():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        select plan_id,
               plan_name,
               price
        from plans
        order by plan_id
    """)

    plans = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(plans)


@app.route('/api/discounts', methods=['POST'])
def api_add_discount():
    data = request.get_json()

    plan_id = data.get('plan_id')
    discount_percentage = data.get('discount_percentage')
    valid_from = data.get('valid_from')
    valid_to = data.get('valid_to')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "select coalesce(max(discount_id), 0) + 1 from discounts"
    )

    discount_id = cursor.fetchone()[0]

    cursor.execute(
        """
        insert into discounts
        (discount_id, plan_id, discount_percentage, valid_from, valid_to)
        values (%s, %s, %s, %s, %s)
        """,
        (
            discount_id,
            plan_id,
            discount_percentage,
            valid_from,
            valid_to
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "discount added successfully",
        "discount_id": discount_id
    }), 201


@app.route('/api/discounts/<int:discount_id>', methods=['PUT'])
def api_edit_discount(discount_id):
    data = request.get_json()

    plan_id = data.get('plan_id')
    discount_percentage = data.get('discount_percentage')
    valid_from = data.get('valid_from')
    valid_to = data.get('valid_to')

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        update discounts
        set plan_id = %s,
            discount_percentage = %s,
            valid_from = %s,
            valid_to = %s
        where discount_id = %s
        """,
        (
            plan_id,
            discount_percentage,
            valid_from,
            valid_to,
            discount_id
        )
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "discount updated successfully"
    })


@app.route('/api/discounts/<int:discount_id>', methods=['DELETE'])
def api_delete_discount(discount_id):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "delete from discounts where discount_id = %s",
        (discount_id,)
    )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "discount deleted successfully"
    })


@app.route('/api/reports')
def api_reports():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("select count(*) as total_customers from customers")
    total_customers = cursor.fetchone()["total_customers"]

    cursor.execute("select count(*) as total_plans from plans")
    total_plans = cursor.fetchone()["total_plans"]

    cursor.execute("select count(*) as active_subscriptions from subscriptions where lower(status) = 'active'")
    active_subscriptions = cursor.fetchone()["active_subscriptions"]

    cursor.execute("select coalesce(sum(amount), 0) as total_revenue from payments where lower(status) = 'completed'")
    total_revenue = cursor.fetchone()["total_revenue"]

    cursor.execute("""
        select p.plan_id,
               p.plan_name,
               count(s.subscription_id) as subscription_count
        from plans p
        left join subscriptions s
        on p.plan_id = s.plan_id
        group by p.plan_id, p.plan_name
        order by subscription_count desc
        limit 5
    """)
    popular_plans = cursor.fetchall()

    cursor.execute("""
        select c.customer_id,
               c.name,
               coalesce(sum(p.amount), 0) as total_spending
        from customers c
        join subscriptions s
        on c.customer_id = s.customer_id
        join payments p
        on s.subscription_id = p.subscription_id
        where lower(p.status) = 'completed'
        group by c.customer_id, c.name
        order by total_spending desc
        limit 5
    """)
    highest_spending_customers = cursor.fetchall()

    cursor.execute("""
        select year(payment_date) as year,
               month(payment_date) as month,
               date_format(payment_date, '%b %Y') as month_name,
               sum(amount) as revenue
        from payments
        where lower(status) = 'completed'
        group by year(payment_date),
                 month(payment_date),
                 date_format(payment_date, '%b %Y')
        order by year(payment_date),
                 month(payment_date)
    """)
    monthly_revenue = cursor.fetchall()

    cursor.execute("""
        select p.plan_id,
               p.plan_name,
               count(s.subscription_id) as subscription_count
        from plans p
        left join subscriptions s
        on p.plan_id = s.plan_id
        group by p.plan_id, p.plan_name
        order by subscription_count desc
    """)
    plan_subscription_count = cursor.fetchall()

    cursor.execute("""
        select
            sum(case when lower(status) = 'active' then 1 else 0 end) as active_count,
            sum(case when lower(status) = 'cancelled' then 1 else 0 end) as cancelled_count,
            sum(case when lower(status) = 'expired' then 1 else 0 end) as expired_count
        from subscriptions
    """)

    churn_result = cursor.fetchone()

    churn_analysis = [
        {
            "status": "active",
            "subscription_count": int(churn_result["active_count"] or 0)
        },
        {
            "status": "cancelled",
            "subscription_count": int(churn_result["cancelled_count"] or 0)
        },
        {
            "status": "expired",
            "subscription_count": int(churn_result["expired_count"] or 0)
        }
    ]

    cursor.close()
    connection.close()

    return jsonify({
        "total_customers": total_customers,
        "total_plans": total_plans,
        "active_subscriptions": active_subscriptions,
        "total_revenue": float(total_revenue),
        "popular_plans": popular_plans,
        "highest_spending_customers": highest_spending_customers,
        "monthly_revenue": monthly_revenue,
        "plan_subscription_count": plan_subscription_count,
        "churn_analysis": churn_analysis
    })

if __name__ == "__main__":
    app.run(debug=True)