import os
import uuid
import boto3
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

def upload_file_to_s3_or_local(file_obj):
    aws_bucket = os.getenv('AWS_STORAGE_BUCKET_NAME')
    aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
    aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
    aws_region = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')

    ext = os.path.splitext(file_obj.name)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"

    if aws_bucket and aws_access_key and aws_secret_key:
        try:
            s3 = boto3.client(
                's3',
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=aws_region
            )
            s3.upload_fileobj(
                file_obj,
                aws_bucket,
                unique_filename,
                ExtraArgs={
                    'ACL': 'public-read',
                    'ContentType': file_obj.content_type
                }
            )
            file_url = f"https://{aws_bucket}.s3.{aws_region}.amazonaws.com/{unique_filename}"
            return file_url
        except Exception:
            pass

    # Local fallback
    # Seek back to start of file just in case it was read
    file_obj.seek(0)
    path = default_storage.save(os.path.join('evidence', unique_filename), ContentFile(file_obj.read()))
    return f"{settings.MEDIA_URL}evidence/{unique_filename}"
