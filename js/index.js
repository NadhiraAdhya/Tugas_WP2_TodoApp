// get element by id
const title = document.getElementById("title");
const description = document.getElementById("description");
const button = document.getElementById("button-todo");
const button_clear = document.getElementById("button-clear");
// get element by id

// Open IndexedDB database
const request = indexedDB.open("todoDB", 1);
let db;

request.onerror = function(event) {
    console.error("IndexedDB error:", event.target.errorCode);
};

request.onsuccess = function(event) {
    db = event.target.result;
    fetchTodos(); // Fetch todos when database is opened successfully
};

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    const objectStore = db.createObjectStore("todos", { keyPath: "id", autoIncrement: true });
    objectStore.createIndex("title", "title", { unique: false });
    objectStore.createIndex("description", "description", { unique: false });
};

function addTodoToDB(title, description) {
    const transaction = db.transaction(["todos"], "readwrite");
    const objectStore = transaction.objectStore("todos");

    const todo = { title: title, description: description };
    objectStore.add(todo);

    transaction.oncomplete = function() {
        console.log("Todo added to database.");
        fetchTodos(); // Fetch updated todos after adding a new one
    };

    transaction.onerror = function(event) {
        console.error("Transaction error:", event.target.error);
    };
}

function fetchTodos() {
    const transaction = db.transaction(["todos"], "readonly");
    const objectStore = transaction.objectStore("todos");
    const request = objectStore.getAll();

    request.onsuccess = function(event) {
        const todos = event.target.result;
        displayTodos(todos);
    };

    request.onerror = function(event) {
        console.error("Error fetching todos:", event.target.error);
    };
}

function displayTodos(todos) {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = ""; // Clear existing todo list

    todos.forEach(todo => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${todo.title}</td>
            <td>${todo.description}</td>
            <td class="action-buttons">
                <button class="btn btn-primary">Edit</button>
                <button class="btn btn-danger">Delete</button>
            </td>
        `;
        todoList.appendChild(row);
    });
}

const todoForm = document.getElementById("todo-form");

// Event listener for form submission
todoForm.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission behavior

    // Get input values
    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const title = titleInput.value;
    const description = descriptionInput.value;

    // Check if both fields are filled
    if (!title || !description) {
        alert("Please fill in both title and description.");
        return;
    }

    // Add todo item to IndexedDB
    addTodoToDB(title, description);

    // Clear input fields
    titleInput.value = "";
    descriptionInput.value = "";
});

// Event listener for clearing input fields
const buttonClear = document.getElementById("button-clear");
buttonClear.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent default button behavior

    // Clear input fields
    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    titleInput.value = "";
    descriptionInput.value = "";
});
