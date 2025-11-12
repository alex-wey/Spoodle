import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const CATEGORY_OPTIONS = [
  'veterinary_notes',
  'diagnostic_reports_and_imaging',
  'lab_results',
  'vaccine_record',
] as const;

type CategoryOption = typeof CATEGORY_OPTIONS[number];

function ensureCategory(value?: string): CategoryOption {
  if (!value) {
    return 'veterinary_notes';
  }
  if (!CATEGORY_OPTIONS.includes(value as CategoryOption)) {
    throw new Error(`Invalid CATEGORY. Allowed values: ${CATEGORY_OPTIONS.join(', ')}`);
  }
  return value as CategoryOption;
}

function guessMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf':
      return 'application/pdf';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.doc':
      return 'application/msword';
    case '.docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}

async function uploadToS3(buffer: Buffer, mimeType: string, originalName: string) {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');

  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET_NAME;

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error('Missing AWS configuration. Ensure AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME are set.');
  }

  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const key = `documents/doc-${Date.now()}-${uuidv4()}${path.extname(originalName)}`;

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  }));

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function saveLocally(buffer: Buffer, originalName: string) {
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  const documentsDir = path.join(uploadDir, 'documents');
  await fs.mkdir(documentsDir, { recursive: true });

  const destPath = path.join(documentsDir, `doc-${Date.now()}-${uuidv4()}${path.extname(originalName)}`);
  await fs.writeFile(destPath, buffer);
  return destPath;
}

async function main() {
  const PET_ID = process.env.PET_ID;
  const FILE_PATH = process.env.FILE_PATH;
  const FILE_NAME = process.env.FILE_NAME;
  const USE_S3 = process.env.USE_S3 === 'true';
  const CATEGORY = ensureCategory(process.env.CATEGORY);

  if (!PET_ID) {
    throw new Error('PET_ID env var is required.');
  }
  if (!FILE_PATH) {
    throw new Error('FILE_PATH env var is required.');
  }

  const fileBuffer = await fs.readFile(FILE_PATH);
  const fileStats = await fs.stat(FILE_PATH);
  const originalName = path.basename(FILE_PATH);
  const storedName = FILE_NAME?.trim() || originalName;
  const mimeType = guessMimeType(originalName);

  const pet = await prisma.pet.findUnique({
    where: { id: PET_ID },
    include: {
      petOwner: true,
    },
  });

  if (!pet) {
    throw new Error(`Pet with id=${PET_ID} not found.`);
  }

  let storedPath: string;
  if (USE_S3) {
    storedPath = await uploadToS3(fileBuffer, mimeType, originalName);
  } else {
    storedPath = await saveLocally(fileBuffer, originalName);
  }

  const document = await prisma.document.create({
    data: {
      id: uuidv4(),
      petId: pet.id,
      category: CATEGORY,
      fileName: storedName,
      filePath: storedPath,
      fileSize: fileStats.size,
      mimeType,
    },
  });

  console.log('✅ Document uploaded successfully');
  console.log('Document ID:', document.id);
  console.log('Pet ID:', document.petId);
  console.log('Category:', document.category);
  console.log('Stored file name:', document.fileName);
  console.log('Stored path:', document.filePath);
}

main()
  .catch((error) => {
    console.error('❌ Failed to upload document:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
