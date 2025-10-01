


const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v4evezi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    await client.connect();
    const profilesCollection = client.db('ProfileDB').collection('profiles');
  
    app.get('/profiles', async (req, res) => {
  const allProfiles = await profilesCollection.find().toArray();
  res.send(allProfiles);
});

   
    app.get('/profiles/uid/:uid', async (req, res) => {
      const { uid } = req.params;
      const profile = await profilesCollection.findOne({ uid });
      res.send(profile || {}); 
    });


app.get("/gardenTips", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;
    const tips = await client
      .db("ProfileDB")
      .collection("gardenTips")
      .find()
      .sort({ createdAt: -1 }) 
      .limit(limit)
      .toArray();

    res.json(tips);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tips" });
  }
});


app.get("/gardenTips/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const tip = await client
      .db("ProfileDB")
      .collection("gardenTips")
      .findOne({ _id: new ObjectId(id) });

    res.json(tip || {});
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tip" });
  }
});


app.post("/gardenTips", async (req, res) => {
  try {
    const tip = req.body;
    tip.createdAt = new Date();
    tip.totalLiked = tip.totalLiked || 0;
    const result = await client
      .db("ProfileDB")
      .collection("gardenTips")
      .insertOne(tip);

    res.json({ message: "Garden Tip saved!", insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to save tip" });
  }
});


app.patch("/gardenTips/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; 
    const increment = action === "unlike" ? -1 : 1;

    const result = await client
      .db("ProfileDB")
      .collection("gardenTips")
      .updateOne(
        { _id: new ObjectId(id) },
        { $inc: { totalLiked: increment } }
      );

    res.json({ message: "Like updated!", modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: "Failed to update likes" });
  }
});



    
    app.put('/profiles/uid/:uid', async (req, res) => {
      const { uid } = req.params;
      const profileData = req.body;

      const result = await profilesCollection.updateOne(
        { uid },
        { $set: profileData },
        { upsert: true } 
      );

      res.json({
        message: "Profile saved successfully",
        upsertedId: result.upsertedId?._id,
        modifiedCount: result.modifiedCount,
      });
    });

  
    app.get("/gardenTips/user/:uid", async (req, res) => {
  try {
    const { uid } = req.params;
    const tips = await client
      .db("ProfileDB")
      .collection("gardenTips")
      .find({ uid })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(tips);
  } catch (error) {
    console.error("Error fetching user tips:", error);
    res.status(500).json({ error: "Failed to fetch user tips" });
  }
});

app.put("/gardenTips/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTip = req.body;

    const result = await client
      .db("ProfileDB")
      .collection("gardenTips")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedTip }
      );

    res.json({ message: "Tip updated successfully", modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error("Error updating tip:", error);
    res.status(500).json({ error: "Failed to update tip" });
  }
});


app.delete("/gardenTips/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await client
      .db("ProfileDB")
      .collection("gardenTips")
      .deleteOne({ _id: new ObjectId(id) });

    res.json({ message: "Tip deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
    console.error("Error deleting tip:", error);
    res.status(500).json({ error: "Failed to delete tip" });
  }
});










    console.log("MongoDB connected and API ready!");
  } finally {
    
  }
}
run().catch(console.dir);

app.get('/', (req, res) => res.send('Profile server is running'));

app.listen(port, () => console.log(`Server running on port ${port}`));
