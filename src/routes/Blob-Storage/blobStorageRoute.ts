import express from 'express';
import { uploadBlob, getBlob, downloadBlob, deleteBlob } from '../../Helpers/Azure/Blob-Storage/Blob-Storage';
import multer from 'multer';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadBlob);

router.get('/:container/:fileName', getBlob);

router.get('/download/:container/:fileName', downloadBlob);

router.delete('/delete', deleteBlob);

export default router; 