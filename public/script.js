const API = "/api/users";
const tableBody = document.querySelector("#user-table tbody");
const dlg = document.querySelector("#user-dialog");
const form = document.querySelector("#user-form");
const title = document.querySelector("#dlg-title");
let editingId = null;

const fetchUsers = async () => (await fetch(API)).json();

/* ---------- render ---------- */
async function render() {
  const users = await fetchUsers();
  tableBody.innerHTML = users.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>
        <button data-edit="${u.id}">✏️</button>
        <button data-del="${u.id}">🗑️</button>
      </td>
    </tr>`).join("");
}

/* ---------- add ---------- */
document.getElementById("add-btn").onclick = () => {
  editingId = null;
  form.reset();
  title.textContent = "Add User";
  dlg.showModal();
};

/* ---------- edit ---------- */
tableBody.addEventListener("click", (e) => {
  if (e.target.dataset.edit) {
    const id = Number(e.target.dataset.edit);
    const row = e.target.closest("tr").children;
    editingId = id;
    form.id.value = id;
    form.name.value = row[1].textContent;
    form.email.value = row[2].textContent;
    title.textContent = "Edit User";
    dlg.showModal();
  }
});

/* ---------- delete ---------- */
tableBody.addEventListener("click", async (e) => {
  if (e.target.dataset.del) {
    const id = e.target.dataset.del;
    await fetch(`${API}/${id}`, { method: "DELETE" });
    render();
  }
});

/* ---------- submit ---------- */
form.onsubmit = async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const method = editingId ? "PUT" : "POST";
  const url = editingId ? `${API}/${editingId}` : API;
  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  dlg.close();
  render();
};

render();
