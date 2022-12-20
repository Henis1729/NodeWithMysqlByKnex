import fs from "fs";
// import { imagesAllowed, videoAllowed } from "./common";
// import { uploadFileToS3, deleteFileFromS3 } from "./s3Upload";
// import { s3Client } from "./s3Client";
// import { ListObjectsCommand } from "@aws-sdk/client-s3";
import multer from 'multer';
import path from 'path';

export const fileUpload = async (file) => {
	if (file) {
		let base64String = file;
		let base64Image = base64String?.split(";base64,");
		let extension = base64Image[0].split("/").pop();
		if (imagesAllowed.includes(extension)) {
			const imgName = `${+new Date()}.${extension}`;
			if (!fs.existsSync(process.env.ASSETS_STORAGE)) fs.mkdirSync(process.env.ASSETS_STORAGE);
			fs.writeFileSync(`${process.env.ASSETS_STORAGE}/${imgName}`, base64Image[1], { encoding: "base64" });
			return imgName;
		}
		return "";
	} else {
		return "";
	}
};

export const fileUploadImageS3 = async (file, folder) => {
	if (file) {
		let filename = `${folder}/` + +new Date() + ".jpeg";
		let buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), "base64");
		const bucketParams = {
			Bucket: process.env.BUCKET_NAME,
			Key: filename,
			Body: buf,
			ContentEncoding: "base64",
			ContentType: "image/jpeg",
			ACL: "public-read",
		};
		await uploadFileToS3(bucketParams);
		file = filename;
		return file;

	}
};

export const fileUploadPdfS3 = async (file, folder) => {
	if (file) {
		let filename = `${folder}/` + +new Date() + ".pdf";
		let buf = Buffer.from(file.replace("data:application/pdf;base64,", ""), "base64");
		const bucketParams = {
			Bucket: process.env.BUCKET_NAME,
			Key: filename,
			Body: buf,
			ContentEncoding: "base64",
			ContentType: "application/pdf",
			ACL: "public-read",
		};
		let data = await uploadFileToS3(bucketParams);
		file = filename;
		return file;

	}
};

export const fileDeleteImageS3 = async (file) => {
	if (file) {
		let filename = file;
		const bucketParams = {
			Bucket: process.env.BUCKET_NAME,
			Key: filename,
		};
		let flag = await deleteFileFromS3(bucketParams);
		return flag;
	}
};



export const bucketParams = { Bucket: process.env.BUCKET_NAME };
export const run = async () => {
	try {
		const data = await s3Client.send(new ListObjectsCommand(bucketParams));
		let s = 0
		data.Contents.map((e) => {
			console.log("🚀 Size ==>", e.Size)
			s += e.Size;
		})
		console.log("total Size ==> ", s)
		// console.log("Success", data.Contents.length);
		// console.log("Contents[1].image.Key", Contents[1].image.Key)
		return data;
	} catch (err) {
		console.log("Error", err);
	}
};

// run()
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, process.env.ASSETS_STORAGE);
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});
export const upload = multer({ storage: storage }).single('file');