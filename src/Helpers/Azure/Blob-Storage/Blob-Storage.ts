import { BlobServiceClient, BlobSASPermissions } from "@azure/storage-blob";
import multer from "multer";
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONECTION_STRING || "");

export const uploadBlob = async(req: Request, res: Response) => {
    try {
        const { container } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "No se envió ningún archivo" });
        }
        const { originalname, buffer } = req.file;

        const containerClient = blobServiceClient.getContainerClient(container);
        const blobClient = containerClient.getBlockBlobClient(originalname);
        
        // Subir el archivo
        await blobClient.uploadData(buffer);
        
        // Generar URL de visualización con SAS
        const sasOptions = {
            permissions: BlobSASPermissions.parse("r"),
            expiresOn: new Date("2099-12-31") 
        };
        
        const viewUrl = await blobClient.generateSasUrl(sasOptions);
        
        res.status(200).json({ 
            message: "Archivo subido correctamente",
            viewUrl: viewUrl
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ message: errorMessage });
    }
}

export const getBlob = async(req: Request, res: Response) => {
    try {
        const { container, fileName } = req.params;

        const containerClient = blobServiceClient.getContainerClient(container);

        res.header("Content-Type", "image/jpeg");

        const response = await containerClient.getBlockBlobClient(fileName).downloadToBuffer();

        res.send(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ message: errorMessage });
    }
}

export const downloadBlob = async(req: Request, res: Response) => {
    try {
        const { container, fileName } = req.params;

        const containerClient = blobServiceClient.getContainerClient(container);

        const response = await containerClient.getBlockBlobClient(fileName).downloadToBuffer();

        res.send(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ message: errorMessage });
    }
}

export const deleteBlob = async(req: Request, res: Response) => {
    try {
        const { container, fileName } = req.body;

        const containerClient = blobServiceClient.getContainerClient(container);

        const response = await containerClient.getBlockBlobClient(fileName).deleteIfExists();

        res.status(200).json({ message: "Archivo eliminado correctamente" });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ message: errorMessage });
    }
}