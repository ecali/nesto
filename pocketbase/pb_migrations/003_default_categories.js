/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const categories = app.findCollectionByNameOrId("categories")
  const typeField = categories.fields.find((f: any) => f.name === "type")
  if (typeField) {
    typeField.values = ["expense", "income", "appointment", "reminder"]
  }
  app.save(categories)

  const defaults = [
    { name: "Alimentari", icon: "shopping-cart", color: "#ef4444", type: "expense" },
    { name: "Bollette", icon: "file-text", color: "#f97316", type: "expense" },
    { name: "Casa", icon: "home", color: "#eab308", type: "expense" },
    { name: "Trasporti", icon: "car", color: "#22c55e", type: "expense" },
    { name: "Salute", icon: "heart", color: "#06b6d4", type: "expense" },
    { name: "Tempo libero", icon: "gamepad", color: "#8b5cf6", type: "expense" },
    { name: "Abbigliamento", icon: "shirt", color: "#ec4899", type: "expense" },
    { name: "Ristorante", icon: "utensils", color: "#f43f5e", type: "expense" },
    { name: "Altro", icon: "more-horizontal", color: "#6b7280", type: "expense" },
    { name: "Stipendio", icon: "briefcase", color: "#22c55e", type: "income" },
    { name: "Freelance", icon: "laptop", color: "#06b6d4", type: "income" },
    { name: "Vendite", icon: "shopping-bag", color: "#8b5cf6", type: "income" },
    { name: "Interessi", icon: "trending-up", color: "#eab308", type: "income" },
    { name: "Rimborsi", icon: "rotate-ccw", color: "#f97316", type: "income" },
    { name: "Altro", icon: "more-horizontal", color: "#6b7280", type: "income" },
  ]

  for (const cat of defaults) {
    const existing = app.findRecordsByFilter("categories", `name = "${cat.name}" && type = "${cat.type}"`)
    if (existing.length === 0) {
      app.save(new Record("categories", cat))
    }
  }
}, (app) => {
  // no rollback needed for defaults
})
