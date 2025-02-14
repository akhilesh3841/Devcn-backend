import validator from "validator";

export const validateSignUpData = (req) => {
    const { firstName, lastName, emailId, password } = req.body;
    if (!firstName || !lastName) {
        throw new Error("First name and last name are required");
    }
    if (!emailId || !validator.isEmail(emailId)) {
        throw new Error("Invalid email address");
    }
    if (!validator.isStrongPassword(password)) {
        throw new Error("Please enter a strong password");
    }
    return true;
};

export const validateEditProfileData = (req) => {
    const allowedEditFields = ["firstName", "lastName", "emailId", "photoUrl", "gender", "age", "about", "skills"];

    if (!req || !req.body || typeof req.body !== "object") {
        return { isValid: false, message: "Invalid request body" };
    }

    const fields = Object.keys(req.body);

    if (fields.length === 0) {
        return { isValid: false, message: "No fields provided for update" };
    }

    const invalidFields = fields.filter(field => !allowedEditFields.includes(field));

    if (invalidFields.length > 0) {
        return { isValid: false, message: `Invalid fields: ${invalidFields.join(", ")}` };
    }

    return { isValid: true };
};

