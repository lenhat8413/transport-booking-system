const authService = require("../services/auth.service");
const { AuthServiceError } = require("../services/auth.service");

// Helper: maps an AuthServiceError to the correct HTTP response
function handleError(res, err, label) {
	if (err instanceof AuthServiceError) {
		return res.status(err.statusCode).json({
			status: "error",
			message: err.message,
		});
	}
	console.error(`[${label}]`, err);
	return res.status(500).json({ status: "error", message: "Internal server error." });
}

// POST /api/auth/register
exports.registerUser = async (req, res) => {
	try {
		const result = await authService.registerUser(req.body);
		res.status(201).json(result);
	} catch (err) {
		handleError(res, err, "registerUser");
	}
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
	try {
		const result = await authService.loginUser(req.body);
		res.status(200).json(result);
	} catch (err) {
		handleError(res, err, "loginUser");
	}
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
	try {
		const result = await authService.forgotPassword(req.body);
		res.status(200).json(result);
	} catch (err) {
		handleError(res, err, "forgotPassword");
	}
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
	try {
		const result = await authService.resetPassword(req.body);
		res.status(200).json(result);
	} catch (err) {
		handleError(res, err, "resetPassword");
	}
};
