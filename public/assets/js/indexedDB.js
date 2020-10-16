let db;

// new db request for a "budgetbuddy" database.
const request = indexedDB.open("budgetbuddy", 1);
// Create Schema
request.onupgradeneeded = function (event) {
    // object store called "pending", autoIncrement true
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = event => {
    db = event.target.result;

    // check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = event => {
    console.log("IndexedDB Request Error: " + event.target.errorCode);
};

function saveRecord(record) {
    // Open transaction (tx) to access object store, needed for operations on database
    // readwrite permission
    const transaction = db.transaction(["pending"], "readwrite");

    // access pending object store
    const store = transaction.objectStore("pending");

    // add record to store with add method.
    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    // get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    // if successful, open a transaction on your pending db
                    const transaction = db.transaction(["pending"], "readwrite");

                    // access your pending object store
                    const store = transaction.objectStore("pending");

                    // clear all items in store
                    // store.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
