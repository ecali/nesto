/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const categories = new Collection({
    name: "categories",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "name", type: "text", required: true, unique: true, max: 100 },
      { name: "icon", type: "text", max: 50 },
      { name: "color", type: "text", max: 7 },
      { name: "type", type: "select", required: true, values: ["expense", "appointment", "reminder"] },
    ],
  })
  app.save(categories)

  const expenses = new Collection({
    name: "expenses",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "amount", type: "number", required: true, min: 0 },
      { name: "category", type: "text", required: true, max: 100 },
      { name: "description", type: "text", required: true, max: 500 },
      { name: "date", type: "date", required: true },
      { name: "paid_by", type: "relation", required: true, collectionId: app.findCollectionByNameOrId("users").id, maxSelect: 1 },
    ],
    indexes: ["CREATE INDEX idx_expenses_date ON expenses (date)"],
  })
  app.save(expenses)

  const appointments = new Collection({
    name: "appointments",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "title", type: "text", required: true, max: 200 },
      { name: "description", type: "text", max: 500 },
      { name: "date", type: "date", required: true },
      { name: "time", type: "text", max: 5 },
      { name: "duration", type: "number", min: 0 },
      { name: "created_by", type: "relation", required: true, collectionId: app.findCollectionByNameOrId("users").id, maxSelect: 1 },
    ],
    indexes: ["CREATE INDEX idx_appointments_date ON appointments (date)"],
  })
  app.save(appointments)

  const reminders = new Collection({
    name: "reminders",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "title", type: "text", required: true, max: 200 },
      { name: "description", type: "text", max: 500 },
      { name: "type", type: "select", required: true, values: ["todo", "recurring", "one-time"] },
      { name: "due_date", type: "date", required: true },
      { name: "recurring_rule", type: "text", max: 100 },
      { name: "done", type: "bool", required: true },
      { name: "created_by", type: "relation", required: true, collectionId: app.findCollectionByNameOrId("users").id, maxSelect: 1 },
    ],
    indexes: ["CREATE INDEX idx_reminders_due_date ON reminders (due_date)", "CREATE INDEX idx_reminders_done ON reminders (done)"],
  })
  app.save(reminders)
}, (app) => {
  app.delete(app.findCollectionByNameOrId("reminders"))
  app.delete(app.findCollectionByNameOrId("appointments"))
  app.delete(app.findCollectionByNameOrId("expenses"))
  app.delete(app.findCollectionByNameOrId("categories"))
})
