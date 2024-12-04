const express = require("express");
const AWS = require("aws-sdk");
const multer = require("multer");
const upload = multer();
const app = express();
const path = require("path");

// Cấu hình để phục vụ các tệp tĩnh từ thư mục "public"
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // Dùng để phân tích cú pháp JSON

// Route xử lý đường dẫn "/"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route xử lý "/test"
app.post("/test", upload.single("file"), async(req, res) => {
    const { endpoint, accessKey, secretKey, region, bucket } = req.body;
    const file = req.file;

    // Kiểm tra tham số đầu vào
    if (!endpoint || !accessKey || !secretKey || !region || !bucket || !file) {
        return res.status(400).send("Missing required parameters.");
    }

    const s3 = new AWS.S3({
        endpoint: new AWS.Endpoint(endpoint), // Cần đảm bảo endpoint đúng định dạng
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
        region,
        s3ForcePathStyle: true, // Thêm tùy chọn này nếu sử dụng dịch vụ S3 không phải AWS
    });

    try {
        // Upload test
        const uploadStart = Date.now();
        await s3
            .upload({
                Bucket: bucket,
                Key: file.originalname,
                Body: file.buffer,
            })
            .promise();
        const uploadEnd = Date.now();

        // Download test
        const downloadStart = Date.now();
        await s3.getObject({ Bucket: bucket, Key: file.originalname }).promise();
        const downloadEnd = Date.now();

        const uploadTime = (uploadEnd - uploadStart) / 1000; // Thời gian upload (s)
        const downloadTime = (downloadEnd - downloadStart) / 1000; // Thời gian download (s)
        const fileSizeMB = file.size / (1024 * 1024); // Kích thước file (MB)

        res.send({
            uploadSpeed: (fileSizeMB / uploadTime).toFixed(2) + " MB/s",
            downloadSpeed: (fileSizeMB / downloadTime).toFixed(2) + " MB/s",
        });
    } catch (err) {
        res.status(500).send("Error testing S3 speed: " + err.message);
    }
});

// Khởi chạy server
app.listen(3000, () => console.log("Server is running on http://localhost:3000"));