import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Check if the token is in the correct format
        if (token.split('.').length !== 3) {
            console.error("Malformed Token:", token); // Log the malformed token
            throw new ApiError(401, "jwt malformed");
        }

        //console.log("Token:", token); // Log the token

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT Error:", error); // Log the error
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            throw new ApiError(403, "You are not authorized to perform this action");
        }
        next();
    };
};

export { verifyJWT, checkRole };