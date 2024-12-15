// app/api/s3/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // Parse request body
    const { filename, contentType } = body;

    // Set up S3 upload parameters
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: 'userId/sessionId' + filename,
      ContentType: contentType
    });

    // Generate pre-signed URL for S3 upload
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600
    });

    return NextResponse.json({ signedUrl }, { status: 200 });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate pre-signed URL' },
      { status: 500 }
    );
  }
}
