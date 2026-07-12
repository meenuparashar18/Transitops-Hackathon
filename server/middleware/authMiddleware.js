// Agar wahan upar import ho toh comment karke direct variable bana do:
import jwt from "jsonwebtoken";

// 🌟 FIX: Controller ki tarah yahan bhi direct key set kar di taaki import-export ka issue khatam ho jaye
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

export const authenticateToken = (req, res, next) => {
  // 1. Incoming request ke headers se Authorization header nikalna
  const authHeader = req.headers["authorization"];
  
  // Header format 'Bearer <token>' hota hai, toh hum space se split karke sirf token nikalte hain
  const token = authHeader && authHeader.split(" ")[1];

  // 2. Agar token nahi milta, toh request ko block karo
  if (!token) {
    return res.status(401).json({ error: "Access Denied: No Token Provided" });
  }

  try {
    // 3. Token ko hamari secret key ke sath verify karo
    const verified = jwt.verify(token, JWT_SECRET);
    
    // Verified user ka data (email, role) request object mein attach karo taaki routes isse use kar sakein
    req.user = verified;
    
    // Sab sahi hai, toh aage badhne do (next middleware ya controller par)
    next(); 
  } catch (error) {
    // 4. Agar token fake hai ya expire ho chuka hai
    return res.status(403).json({ error: "Invalid or Expired Token" });
  }
};