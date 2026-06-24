/// <reference path="../pb_data/types.d.ts" />
migrate(function(app) {
  var spaces = new Collection({
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

  var expenses = app.findCollectionByNameOrId("expenses")

  var typeField = new SelectField()
  typeField.name = "type"
  typeField.values = ["expense", "income"]
  expenses.fields.add(typeField)

  var spaceField = new RelationField()
  spaceField.name = "space"
  spaceField.collectionId = spaces.id
  spaceField.maxSelect = 1
  expenses.fields.add(spaceField)

  app.save(expenses)

  var appointments = app.findCollectionByNameOrId("appointments")
  var apptSpaceField = new RelationField()
  apptSpaceField.name = "space"
  apptSpaceField.collectionId = spaces.id
  apptSpaceField.maxSelect = 1
  appointments.fields.add(apptSpaceField)
  app.save(appointments)

  var reminders = app.findCollectionByNameOrId("reminders")
  var remSpaceField = new RelationField()
  remSpaceField.name = "space"
  remSpaceField.collectionId = spaces.id
  remSpaceField.maxSelect = 1
  reminders.fields.add(remSpaceField)
  app.save(reminders)

  var users = app.findCollectionByNameOrId("users")

  var roleField = new SelectField()
  roleField.name = "role"
  roleField.values = ["user", "admin"]
  users.fields.add(roleField)

  var langField = new SelectField()
  langField.name = "language"
  langField.values = ["en", "it", "es"]
  users.fields.add(langField)

  app.save(users)
}, function(app) {
  var users = app.findCollectionByNameOrId("users")
  users.fields.removeByName("role")
  users.fields.removeByName("language")
  app.save(users)

  app.delete(app.findCollectionByNameOrId("spaces"))

  var expenses = app.findCollectionByNameOrId("expenses")
  expenses.fields.removeByName("type")
  expenses.fields.removeByName("space")
  app.save(expenses)

  var appointments = app.findCollectionByNameOrId("appointments")
  appointments.fields.removeByName("space")
  app.save(appointments)

  var reminders = app.findCollectionByNameOrId("reminders")
  reminders.fields.removeByName("space")
  app.save(reminders)
})
