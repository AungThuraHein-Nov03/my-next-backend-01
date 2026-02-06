import { getClientPromise } from "@/lib/mongodb";
export async function ensureIndexes() {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const userCollection  = db.collection("user");
    
    // Attempt to drop the conflicting 'user_1' index if it exists
    try {
        await userCollection.dropIndex("user_1");
        console.log("Successfully dropped conflicting index: user_1");
    } catch (error) {
        // Index likely doesn't exist, ignore
    }

    await userCollection.createIndex({ username: 1 }, { unique: true });
    await userCollection.createIndex({ email: 1 }, { unique: true });
}
