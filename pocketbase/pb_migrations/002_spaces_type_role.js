/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const spaces = new Collection({
    name: "spaces",
    type: "base",
    listRule: "@request.auth.id != ''",
    viewRule: "@request.auth.id != ''",
    createRule: "@request.auth.id != ''",
    updateRule: "@request.auth.id != ''",
    deleteRule: "@request.auth.id != ''",
    fields: [
      { name: "name", type: "text", required: true, max: 200 },
      { name: "type", type: "select", required: true, values: ["private", "public"] },
      { name: "created_by", type: "relation", required: true, collectionId: app.findCollectionByNameOrId("users").id, maxSelect: 1 },
      { name: "members", type: "relation", collectionId: app.findCollectionByNameOrId("users").id, maxSelect: 999 },
    ],
  })
  app.save(spaces)

  const expenses = app.findCollectionByNameOrId("expenses")
  expenses.fields.add({ name: "type", type: "select", required: true, values: ["expense", "income"] })
  expenses.fields.add({ name: "space", type: "relation", collectionId: spaces.id, maxSelect: 1 })
  app.save(expenses)

  const appointments = app.findCollectionByNameOrId("appointments")
  appointments.fields.add({ name: "space", type: "relation", collectionId: spaces.id, maxSelect: 1 })
  app.save(appointments)

  const reminders = app.findCollectionByNameOrId("reminders")
  reminders.fields.add({ name: "space", type: "relation", collectionId: spaces.id, maxSelect: 1 })
  app.save(reminders)

  const users = app.findCollectionByNameOrId("users")
  users.fields.add({ name: "role", type: "select", values: ["user", "admin"] })
  users.fields.add({ name: "language", type: "select", values: ["en", "it", "es"] })
  app.save(users)
}, (app) => {
  const users = app.findCollectionByNameOrId("users")
  users.fields.remove("role")
  users.fields.remove("language")
  app.save(users)

  app.delete(app.findCollectionByNameOrId("spaces"))

  const expenses = app.findCollectionByNameOrId("expenses")
  expenses.fields.remove("type")
  expenses.fields.remove("space")
  app.save(expenses)

  const appointments = app.findCollectionByNameOrId("appointments")
  appointments.fields.remove("space")
  app.save(appointments)

  const reminders = app.findCollectionByNameOrId("reminders")
  reminders.fields.remove("space")
  app.save(reminders)
})
