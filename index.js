
const express = require("express")
const app = express()
const PORT = process.end.PORT || 3001

const fs = require("fs")
const path = require("path")
const pathToFile = path.resolve("./data.json")

const getResources = () => JSON.parse(fs.readFileSync(pathToFile))

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Hello World")
})

app.get("/api/resources", (req, res) => {
  const resources = getResources()
  res.send(resources)
})

app.get("/api/activeresource", (req, res) => {
  const resources = getResources()
  const activeResource = resources.find(resource => resource.status === "active")
  res.send(activeResource)
})

app.get("/api/resources/:id", (req, res) => {
  const resources = getResources()
  const resourceID = req.params.id
  const resource = resources.find((resource) => resource.id === resourceID)
  res.send(resource)
})

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources()
  const resourceID = req.params.id
  const index = resources.findIndex((resource) => resource.id === resourceID)
  const activeResource = resources.find(resource => resource.status === "active")
  
  if(resources[index].status === "complete") {
    return res.status(422).send("This resource is already completed")
  }
  
  resources[index] = req.body

  if(req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("There is already an active resource")
    }

    resources[index].status = "active"
    resources[index].activationTime = new Date()
  }

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if(error) {
      return res.status(422).send("cannot store data in the file!")
    }

    return res.send("Data has been updated")
  })
})

app.post("/api/resources", (req, res) => {
  const resources = getResources()
  const resource = req.body

  resource.createdAt = new Date()
  resource.status = "inactive"
  resource.id = Date.now().toString()
  resources.unshift(resource)

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if(error) {
      return res.status(422).send("cannot store data in the file!")
    }

    return res.send("Data saved")
  })
})

app.listen(PORT, () => {
  console.log("Server is listeing on port:" + PORT)
})