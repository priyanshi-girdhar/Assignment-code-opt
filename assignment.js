const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Mock database for demonstration purposes
const mockDatabase = {
    users: [{ email: "priyanshiexample.com" }],
    saveUser: function(user) {
        this.users.push(user);
        console.log("User saved to database:", user);
        return user;
    }
};

// Validation
function validateUserInput(user) {
    if (!user.name || !user.email || !user.password) {
        throw new Error("Invalid input: Name, email, and password are required");
    }
    // Add more validation as needed (email format, password strength, etc.)
    return true;
}

// Check for existing users
async function checkExistingUser(email) {
    return mockDatabase.users.some(u => u.email === email);
}

// Hash password
async function hashPassword(password, saltRounds = 10) {
    return await bcrypt.hash(password, saltRounds);
}

// Save user to database
async function saveUserToDatabase(user) {
    return mockDatabase.saveUser(user);
}

// Send confirmation email
async function sendConfirmationEmail(userEmail) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
            user: process.env.EMAIL_USER || 'priyanshi@gmail.com', 
            pass: process.env.EMAIL_PASS || 'password' 
        }
    });

    const mailOptions = {
        from: 'priyanshi@gmail.com',
        to: userEmail,
        subject: 'Welcome!',
        text: 'Thank you for registering!'
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return true;
    } catch (error) {
        console.log("Email failed", error);
        throw error;
    }
}

// Main registration function
async function registerUser(user) {
    try {
        // Validate input
        validateUserInput(user);
        
        // Check if user exists
        const userExists = await checkExistingUser(user.email);
        if (userExists) {
            throw new Error("Email already exists");
        }
        
        // Hash password
        const hashedPassword = await hashPassword(user.password);
        
        // Create user object
        const newUser = { 
            name: user.name, 
            email: user.email, 
            password: hashedPassword 
        };
        
        // Save user
        await saveUserToDatabase(newUser);
        
        // Send email (don't await to not block the response)
        sendConfirmationEmail(user.email)
            .catch(error => console.error("Email sending error:", error));
        
        console.log("User registered successfully!");
        return newUser;
    } catch (error) {
        console.error("Registration failed:", error.message);
        throw error; // Re-throw for the caller to handle
    }
}

// Example usage
registerUser({ name: "Priyanshi", email: "priyanshi@gmail.com", password: "password" })
    .then(user => console.log("Registered user:", user))
    .catch(error => console.error("Error in registration:", error.message));