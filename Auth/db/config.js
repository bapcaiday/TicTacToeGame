const fs = require("fs");
const path = require("path");

// Đường dẫn đến file JSON chứa dữ liệu kết nối
const dataFilePath = "././data.json"

// Đọc dữ liệu từ file JSON
const data = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));

module.exports = data;