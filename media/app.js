const express = require('express');
const multer = require('multer');
const path = require('path');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const app = express();
const port = process.env.PORT || 3000;

// Azure Blob Storage configuration
const connectionString = "DefaultEndpointsProtocol=https;AccountName=webappstorage99;AccountKey=K86fR2uqV10ccYAcrHVlpAzyHnaq9qY1otiqb4F3392CGyiZ1ZeOUu9PuJwkl5azeqCUsFMNWT6U+AStx3rJKw==;EndpointSuffix=core.windows.net";
const containerName = "webappdata";

const sharedKeyCredential = new StorageSharedKeyCredential("webappstorage99", "K86fR2uqV10ccYAcrHVlpAzyHnaq9qY1otiqb4F3392CGyiZ1ZeOUu9PuJwkl5azeqCUsFMNWT6U+AStx3rJKw==");
const blobServiceClient = new BlobServiceClient(`https://${sharedKeyCredential.accountName}.blob.core.windows.net`, sharedKeyCredential);
const containerClient = blobServiceClient.getContainerClient(containerName);

// Set up Multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Set up a simple form for file upload
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Handle file upload and upload to Blob Storage
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No files were uploaded.');
  }

  const blobName = req.file.filename;
  const filePath = req.file.path;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  try {
    const uploadBlobResponse = await blockBlobClient.uploadFile(filePath);
    console.log("File uploaded to Blob Storage:", uploadBlobResponse.requestId);
    res.send('File uploaded to Blob Storage successfully!');
  } catch (error) {
    console.error("Error uploading file to Blob Storage:", error);
    res.status(500).send('Error uploading file to Blob Storage');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
