const Modal = {
    open() {
        // Method
        document.querySelector(".modal-overlay").classList.add("active");
    },
    close() {
        document.querySelector(".modal-overlay").classList.remove("active");
    },
};

const Storage = {
    get() {
        return (
            JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
        );
    },
    set(transactions) {
        localStorage.setItem(
            "dev.finances:transactions",
            JSON.stringify(transactions)
        );
    },
};

const Transaction = {
    all: Storage.get(),
    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },
    remove(index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },
    incomes() {
        let income = 0;

        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        });

        return income;
    },
    expenses() {
        let expense = 0;

        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        });

        return expense;
    },
    total() {
        return this.incomes() + this.expenses();
    },
};

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),
    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        DOM.transactionsContainer.appendChild(tr);
        index = tr.dataset.index;
    },
    innerHTMLTransaction(transaction, index) {
        const cssClass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${cssClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remove Transaction">
        </td>
        `;
        return html;
    },
    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML =
            Utils.formatCurrency(Transaction.incomes());

        document.getElementById("expenseDisplay").innerHTML =
            Utils.formatCurrency(Transaction.expenses());

        document.getElementById("totalDisplay").innerHTML =
            Utils.formatCurrency(Transaction.total());
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    },
};

const Utils = {
    formatAmount(value) {
        value = Number(value) * 100;
        return Math.round(value);
    },
    formatDate(date) {
        const splittedDate = date.split("-");
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");
        value = Number(value) / 100;

        value = value.toLocaleString("en", {
            style: "currency",
            currency: "AUD",
        });

        return signal + value;
    },
};

const Form = {
    description: document.querySelector("input#description"),
    amount: document.querySelector("input#amount"),
    date: document.querySelector("input#date"),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value,
        };
    },
    validateFields() {
        const { description, amount, date } = this.getValues();

        if (
            description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === ""
        ) {
            throw new Error("All fields are required");
        }
    },
    formatValues() {
        let { description, amount, date } = this.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description, //same as description: description
            amount, //using the same keyword can be shorthanded
            date,
        };
    },
    clearFields() {
        this.description.value = "";
        this.amount.value = "";
        this.date.value = "";
    },
    submit(event) {
        event.preventDefault();

        try {
            this.validateFields();
            const transaction = Form.formatValues();
            Transaction.add(transaction);

            Form.clearFields();
            Modal.close();
        } catch (error) {
            alert(error.message);
        }
    },
};

const App = {
    init() {
        // Transaction.all.forEach(function (transaction) {
        //     DOM.addTransaction(transaction);
        // });

        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    },
};

App.init();