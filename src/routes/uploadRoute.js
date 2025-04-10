"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.default = handler;
const formidable_1 = require("formidable");
const fs_1 = __importDefault(require("fs"));
const blob_1 = require("@vercel/blob");
exports.config = {
    api: {
        bodyParser: false,
    },
};
function setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
}
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        setCorsHeaders(res);
        if (req.method === "OPTIONS") {
            return res.status(200).end();
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
        const form = new formidable_1.IncomingForm();
        form.parse(req, (err, fields, files) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (err) {
                console.error("Form parsing error:", err);
                return res.status(500).json({ message: "Form parsing failed", error: err });
            }
            const file = (_a = files.image) === null || _a === void 0 ? void 0 : _a[0];
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            try {
                const stream = fs_1.default.createReadStream(file.filepath);
                const blob = yield (0, blob_1.put)(file.originalFilename || "default name", stream, {
                    access: 'public',
                });
                return res.status(200).json({ imageUrl: blob.url });
            }
            catch (uploadErr) {
                console.error("Upload error:", uploadErr);
                return res.status(500).json({ message: "Image upload failed", error: uploadErr });
            }
        }));
    });
}
