const mongoose = require('mongoose');
const uri = "mongodb+srv://ahmad2007fcb_db_user:Wf6bdvyXUD5YXav4@cluster0.ysqbrfj.mongodb.net/?appName=Cluster0";

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS");
    process.exit(0);
  })
  .catch(err => {
    console.log("ERROR:", err.message);
    process.exit(1);
  });
