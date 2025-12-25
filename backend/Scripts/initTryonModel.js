// const mongoose = require("mongoose");
// const TryOnJob = require("../models/TryOnJob");
// const TryOnSession = require("../models/TryOnSession");

// async function finalizeIndexes() {
//   try {
//     await mongoose.connect(
//       "mongodb://Alaiy:alaiy2024xyz@35.154.41.149:27017/Altomoda?authSource=admin"
//     );

//     console.log("🔧 Finalizing index setup...\n");

//     // 🔹 CHECK CURRENT STATE
//     const jobIndexes = await TryOnJob.collection.getIndexes();
//     const sessionIndexes = await TryOnSession.collection.getIndexes();
    
//     console.log("Current TryOnJob indexes:");
//     Object.entries(jobIndexes).forEach(([name, index]) => {
//       console.log(`  • ${name}: ${JSON.stringify(index.key)}`);
//     });
    
//     console.log("\nCurrent TryOnSession indexes:");
//     Object.entries(sessionIndexes).forEach(([name, index]) => {
//       console.log(`  • ${name}: ${JSON.stringify(index.key)}`);
//     });

//     // 🔹 FIX MISSING INDEXES
//     console.log("\n🔨 Fixing missing indexes...");
    
//     // Check and fix TryOnJob indexes
//     const requiredJobIndexes = {
//       "tryon_session_ref_index": { tryonSessionId: 1 }
//     };
    
//     for (const [indexName, indexKey] of Object.entries(requiredJobIndexes)) {
//       if (!jobIndexes[indexName]) {
//         console.log(`Creating missing index: ${indexName}...`);
//         try {
//           await TryOnJob.collection.createIndex(indexKey, { name: indexName, background: true });
//           console.log(`✅ Created ${indexName}`);
//         } catch (err) {
//           console.log(`❌ Failed to create ${indexName}: ${err.message}`);
//         }
//       } else {
//         console.log(`✅ ${indexName} already exists`);
//       }
//     }
    
//     // Check and fix TryOnSession indexes
//     const requiredSessionIndexes = {
//       "queue_id_index": { queueId: 1 },
//       "session_expiration_index": { expiresAt: 1 }
//     };
    
//     for (const [indexName, indexKey] of Object.entries(requiredSessionIndexes)) {
//       if (!sessionIndexes[indexName]) {
//         console.log(`Creating missing index: ${indexName}...`);
//         try {
//           if (indexName === "queue_id_index") {
//             await TryOnSession.collection.createIndex(indexKey, { 
//               name: indexName, 
//               unique: true, 
//               background: true 
//             });
//           } else if (indexName === "session_expiration_index") {
//             await TryOnSession.collection.createIndex(indexKey, { 
//               name: indexName, 
//               expireAfterSeconds: 0,
//               background: true 
//             });
//           } else {
//             await TryOnSession.collection.createIndex(indexKey, { 
//               name: indexName, 
//               background: true 
//             });
//           }
//           console.log(`✅ Created ${indexName}`);
//         } catch (err) {
//           console.log(`❌ Failed to create ${indexName}: ${err.message}`);
//         }
//       } else {
//         console.log(`✅ ${indexName} already exists`);
//       }
//     }

//     // 🔹 VERIFY ALL INDEXES
//     console.log("\n🔍 Final verification...");
    
//     const finalJobIndexes = await TryOnJob.collection.getIndexes();
//     const finalSessionIndexes = await TryOnSession.collection.getIndexes();
    
//     console.log(`\n📊 TryOnJob has ${Object.keys(finalJobIndexes).length} indexes:`);
//     Object.entries(finalJobIndexes).forEach(([name, index]) => {
//       console.log(`  • ${name}: ${JSON.stringify(index.key)}`);
//     });
    
//     console.log(`\n📊 TryOnSession has ${Object.keys(finalSessionIndexes).length} indexes:`);
//     Object.entries(finalSessionIndexes).forEach(([name, index]) => {
//       console.log(`  • ${name}: ${JSON.stringify(index.key)}`);
//     });

//     // 🔹 CHECK FOR DUPLICATES
//     console.log("\n🔎 Checking for duplicate indexes...");
    
//     // Check TryOnJob for duplicate keys
//     const jobKeys = new Map();
//     for (const [name, index] of Object.entries(finalJobIndexes)) {
//       const keyStr = JSON.stringify(index.key);
//       if (jobKeys.has(keyStr)) {
//         console.log(`⚠️ Duplicate index found in TryOnJob:`);
//         console.log(`   - ${jobKeys.get(keyStr)}`);
//         console.log(`   - ${name} (consider dropping one)`);
//       } else {
//         jobKeys.set(keyStr, name);
//       }
//     }
    
//     // Check TryOnSession for duplicate keys
//     const sessionKeys = new Map();
//     for (const [name, index] of Object.entries(finalSessionIndexes)) {
//       const keyStr = JSON.stringify(index.key);
//       if (sessionKeys.has(keyStr)) {
//         console.log(`⚠️ Duplicate index found in TryOnSession:`);
//         console.log(`   - ${sessionKeys.get(keyStr)}`);
//         console.log(`   - ${name} (consider dropping one)`);
//       } else {
//         sessionKeys.set(keyStr, name);
//       }
//     }

//     // 🔹 VALIDATE COLLECTIONS
//     console.log("\n📁 Validating collections...");
    
//     try {
//       // Test TryOnJob collection
//       const jobCount = await TryOnJob.countDocuments();
//       console.log(`TryOnJob collection has ${jobCount} documents`);
      
//       // Test TryOnSession collection
//       const sessionCount = await TryOnSession.countDocuments();
//       console.log(`TryOnSession collection has ${sessionCount} documents`);
      
//       // Test a sample query with indexes
//       console.log("\n🧪 Testing queries...");
      
//       // Test TryOnJob query
//       const sampleJob = await TryOnJob.findOne({ status: "pending" })
//         .sort({ createdAt: 1 })
//         .explain("executionStats");
      
//       console.log("✅ TryOnJob query test completed");
      
//       // Test TryOnSession query
//       const sampleSession = await TryOnSession.findOne({ active: true })
//         .explain("executionStats");
      
//       console.log("✅ TryOnSession query test completed");
      
//     } catch (testErr) {
//       console.log("⚠️ Query tests skipped:", testErr.message);
//     }

//     console.log("\n🎉 Index finalization complete!");
//     console.log("\n📋 Final Index Summary:");
//     console.log("TryOnJob: " + Object.keys(finalJobIndexes).length + " indexes");
//     console.log("TryOnSession: " + Object.keys(finalSessionIndexes).length + " indexes");
    
//     // List all indexes with their purposes
//     console.log("\n📚 Index Reference Guide:");
//     console.log("\nTryOnJob Indexes:");
//     console.log("1. _id_ - Primary key (auto)");
//     console.log("2. worker_fifo_index - Worker picks oldest pending jobs");
//     console.log("3. queue_polling_index - Frontend checks queue status");
//     console.log("4. session_index - Find jobs by session");
//     console.log("5. tryon_session_ref_index - Link to TryOnSession");
//     console.log("6. lock_recovery_index - Find stuck processing jobs");
//     console.log("7. user_jobs_index - User history/admin view");
//     console.log("8. session_status_index - Session-specific job queries");
    
//     console.log("\nTryOnSession Indexes:");
//     console.log("1. _id_ - Primary key (auto)");
//     console.log("2. active_session_lookup - Find active user session");
//     console.log("3. queue_id_index - Unique queue identifier");
//     console.log("4. user_sessions_index - Find all user sessions");
//     console.log("5. session_expiration_index - Auto-delete expired sessions (TTL)");
//     console.log("6. active_expiration_index - Find active sessions near expiry");

//     mongoose.connection.close();
//     console.log("\n✅ All done! MongoDB connection closed.");

//   } catch (err) {
//     console.error("❌ Finalization failed:", err);
//     process.exit(1);
//   }
// }

// finalizeIndexes();



require("dotenv").config();

const mongoose = require("mongoose");
const TryOnJob = require("../models/TryOnJob");
const Product = require("../models/Product");

async function run() {
  const MONGO_URI =
    process.env.MONGO_URI ||
    "mongodb://Alaiy:alaiy2024xyz@35.154.41.149:27017/Altomoda?authSource=admin";

  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const jobs = await TryOnJob.find({
    parentSku: { $exists: false }
  });

  console.log(`Found ${jobs.length} jobs to update`);

  for (const job of jobs) {
    try {
      const product = await Product.findOne({
        "imgs.url": job.productImageUrl
      });

      if (!product) {
        console.warn(
          `❌ No product found for image: ${job.productImageUrl}`
        );
        continue;
      }

      const parentSku =
        product.props?.sku_parent || product.sku;

      if (!parentSku) {
        console.warn(`❌ SKU missing for product ${product._id}`);
        continue;
      }

      await TryOnJob.updateOne(
        { _id: job._id },
        { $set: { parentSku } }
      );

      console.log(`✅ Updated job ${job._id} → ${parentSku}`);
    } catch (err) {
      console.error(`❌ Failed job ${job._id}`, err.message);
    }
  }

  console.log("🎉 Migration completed");
  process.exit(0);
}

run();
